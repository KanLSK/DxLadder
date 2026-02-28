import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Room from '@/models/Room';
import Match from '@/models/Match';
import MatchCase from '@/models/MatchCase';
import { auth } from '@/lib/auth';
import { generateCasePayload, runCritic } from '@/lib/aiPipeline';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const session = await auth();
    const body = await request.json();
    const { roomId } = body;

    const playerKey = session?.user?.id || body.playerKey;
    if (!playerKey || !roomId) {
      return NextResponse.json({ ok: false, error: 'Missing roomId or player identity' }, { status: 400 });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json({ ok: false, error: 'Room not found' }, { status: 404 });
    }

    // Only host can start
    if (room.hostKey !== playerKey) {
      return NextResponse.json({ ok: false, error: 'Only the host can start the match' }, { status: 403 });
    }
    if (room.status !== 'lobby') {
      return NextResponse.json({ ok: false, error: 'Room is not in lobby state' }, { status: 400 });
    }

    // Need at least 1 player (including host)
    if (room.players.length < 1) {
      return NextResponse.json({ ok: false, error: 'Need at least 1 player' }, { status: 400 });
    }

    // Set room to generating
    room.status = 'generating';
    await room.save();

    // Create match record
    const match = await Match.create({
      roomId: room._id,
      status: 'generating',
      results: room.players.map(p => ({
        playerKey: p.playerKey,
        name: p.name,
        score: 0,
        layersUsed: 1,
        wrongGuesses: 0,
        guesses: [],
        sabotagesUsed: 0,
        finished: false,
      })),
      sabotageEvents: [],
    });

    // Generate case via Gemini (with critic + retry loop)
    const params = room.settings.generationParams || {};
    const MAX_RETRIES = 2;
    let attempts = 0;
    let finalPayload = null;
    let lastError = '';

    while (attempts < MAX_RETRIES) {
      try {
        const draftPayload = await generateCasePayload(params);

        // Run critic on all attempts for party mode (fairness matters)
        try {
          const criticResult = await runCritic(draftPayload);
          if (!criticResult.passes) {
            console.warn(`Party case critic fail: ${criticResult.issues.join(', ')}`);
            lastError = `Critic rejected: ${criticResult.issues.join(', ')}`;
            attempts++;
            continue;
          }
        } catch (criticErr: any) {
          console.warn('Critic call failed, using draft as-is:', criticErr.message);
        }

        finalPayload = draftPayload;
        break;
      } catch (genError: any) {
        const errMsg = genError.message || String(genError);
        console.error('Party case generation error:', errMsg);
        lastError = errMsg;

        if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED')) {
          room.status = 'lobby';
          await room.save();
          await Match.deleteOne({ _id: match._id });
          return NextResponse.json(
            { ok: false, error: 'Gemini API rate limit. Please wait and try again.' },
            { status: 429 }
          );
        }
      }
      attempts++;
    }

    if (!finalPayload) {
      room.status = 'lobby';
      await room.save();
      match.status = 'ended';
      await match.save();
      return NextResponse.json(
        { ok: false, error: lastError || 'Failed to generate case' },
        { status: 500 }
      );
    }

    // Store ephemeral match case (TTL = 24h)
    const matchCaseDoc = await MatchCase.create({
      matchId: match._id,
      contentPublic: {
        layers: finalPayload.content.layers as any,
      },
      contentPrivate: {
        diagnosis: finalPayload.content.diagnosis,
        aliases: finalPayload.content.aliases || [],
        teachingPoints: finalPayload.content.teachingPoints || [],
        answerCheck: finalPayload.content.answerCheck || { rationale: '', keyDifferentials: [] },
        mechanismQuestions: finalPayload.content.mechanismQuestions || undefined,
      },
      generationParams: params,
      title: finalPayload.title,
      systemTags: finalPayload.systemTags || params.systemTags || [],
      difficulty: finalPayload.difficulty || params.difficulty || 3,
      style: finalPayload.style || params.style || 'apk',
      promptMeta: {
        promptVersion: 'v3.0.0-party',
        criticVersion: 'v1.0.0',
      },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // Activate the match
    match.matchCaseId = matchCaseDoc._id;
    match.status = 'active';
    match.startedAt = new Date();
    await match.save();

    room.currentMatchId = match._id;
    room.status = 'in_match';
    await room.save();

    return NextResponse.json({
      ok: true,
      matchId: match._id.toString(),
    });
  } catch (error: any) {
    console.error('Error starting match:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
