import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import GameRoom from '@/models/GameRoom';
import GameMatch from '@/models/GameMatch';
import MatchCase from '@/models/MatchCase';
import { auth } from '@/lib/auth';
import { generateCasePayload, runCritic } from '@/lib/aiPipeline';
import { getPusherServer, channels, events } from '@/lib/pusher';
import mongoose from 'mongoose';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await dbConnect();
    const session = await auth();
    const { roomId } = await params;

    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Auth required' }, { status: 401 });
    }
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return NextResponse.json({ ok: false, error: 'Invalid room ID' }, { status: 400 });
    }

    const room = await GameRoom.findById(roomId);
    if (!room) {
      return NextResponse.json({ ok: false, error: 'Room not found' }, { status: 404 });
    }
    if (room.hostId !== userId) {
      return NextResponse.json({ ok: false, error: 'Only host can start' }, { status: 403 });
    }
    if (room.status !== 'lobby') {
      return NextResponse.json({ ok: false, error: 'Room not in lobby' }, { status: 400 });
    }

    // Need minimum players for the team size
    const minPlayers = room.settings.teamSize === 1 ? 2 : room.settings.teamSize * 2;
    if (room.players.length < Math.min(minPlayers, 2)) {
      return NextResponse.json({ ok: false, error: `Need at least 2 players` }, { status: 400 });
    }

    const pusher = getPusherServer();
    const channelName = channels.room(roomId);

    // Transition: lobby → generating
    room.status = 'generating';
    await room.save();
    await pusher.trigger(channelName, events.MATCH_GENERATING, { status: 'generating' });

    // Build generation params from room settings
    const genParams = {
      difficulty: room.settings.difficulty,
      style: room.settings.style,
      ...room.settings.generationParams,
    };

    // Generate case with critic (max 2 retries)
    let finalPayload = null;
    let lastError = '';

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const draft = await generateCasePayload(genParams);
        try {
          const critic = await runCritic(draft);
          if (!critic.passes) {
            lastError = critic.issues.join(', ');
            continue;
          }
        } catch { /* critic fail, use draft */ }

        finalPayload = draft;
        break;
      } catch (err: any) {
        lastError = err.message;
        if (err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
          room.status = 'lobby';
          await room.save();
          return NextResponse.json({ ok: false, error: 'Rate limited, try again' }, { status: 429 });
        }
      }
    }

    if (!finalPayload) {
      room.status = 'lobby';
      await room.save();
      return NextResponse.json({ ok: false, error: lastError || 'Generation failed' }, { status: 500 });
    }

    // Create ephemeral match case (TTL 24h)
    const matchCase = await MatchCase.create({
      matchId: new mongoose.Types.ObjectId(), // placeholder, updated after match creation
      contentPublic: { layers: finalPayload.content.layers as any },
      contentPrivate: {
        diagnosis: finalPayload.content.diagnosis,
        aliases: finalPayload.content.aliases || [],
        teachingPoints: finalPayload.content.teachingPoints || [],
        answerCheck: finalPayload.content.answerCheck || { rationale: '', keyDifferentials: [] },
        mechanismQuestions: finalPayload.content.mechanismQuestions || undefined,
      },
      generationParams: genParams,
      title: finalPayload.title,
      systemTags: finalPayload.systemTags || [],
      difficulty: room.settings.difficulty,
      style: room.settings.style,
      promptMeta: { promptVersion: 'v3.0.0-games', criticVersion: 'v1.0.0' },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    // Create GameMatch
    const match = await GameMatch.create({
      type: 'friend',
      mode: room.settings.mode,
      teamSize: room.settings.teamSize,
      status: 'countdown',
      roomId: room._id,
      assignedParams: {
        difficulty: room.settings.difficulty,
        style: room.settings.style,
        noiseLevel: genParams.noiseLevel || 'realistic',
        redHerring: genParams.redHerring || 'none',
        timeline: genParams.timeline || 'acute',
      },
      players: room.players.map(p => ({
        userId: p.userId,
        name: p.name,
        teamId: p.teamId,
        layersUsed: 1,
        wrongGuesses: 0,
        guesses: [],
        score: 0,
        sabotagesUsed: 0,
        finished: false,
        connected: true,
        sessionToken: p.sessionToken,
      })),
      matchCaseId: matchCase._id,
      ratingChanges: [],
      breakdown: { scoringLines: {}, keyEvents: [] },
      sabotageEvents: [],
      eventSeq: 0,
    });

    // Update matchCase with real matchId
    matchCase.matchId = match._id;
    await matchCase.save();

    // Update room
    room.currentMatchId = match._id;
    room.status = 'countdown';
    await room.save();

    // Broadcast case_ready + countdown
    const matchChannelName = channels.match(match._id.toString());
    await pusher.trigger(channelName, events.CASE_READY, {
      matchId: match._id.toString(),
    });

    // 5-second countdown, then transition to active
    setTimeout(async () => {
      try {
        const m = await GameMatch.findById(match._id);
        if (m && m.status === 'countdown') {
          m.status = 'active';
          m.startedAt = new Date();
          await m.save();

          const r = await GameRoom.findById(roomId);
          if (r) {
            r.status = 'active';
            await r.save();
          }

          await pusher.trigger(matchChannelName, events.MATCH_STARTED, {
            matchId: match._id.toString(),
            startedAt: m.startedAt.toISOString(),
          });
        }
      } catch (e) {
        console.error('Countdown->active transition error:', e);
      }
    }, 5000);

    return NextResponse.json({
      ok: true,
      matchId: match._id.toString(),
      countdownMs: 5000,
    });
  } catch (error: any) {
    console.error('Error starting game match:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
