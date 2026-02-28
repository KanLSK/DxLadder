import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Match from '@/models/Match';
import MatchCase from '@/models/MatchCase';
import Room from '@/models/Room';
import { auth } from '@/lib/auth';
import { isCorrectGuess } from '@/lib/answerMatch';
import { calculateScore, MAX_LAYERS } from '@/lib/partyUtils';
import mongoose from 'mongoose';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    await dbConnect();
    const session = await auth();
    const body = await request.json();
    const { matchId } = await params;
    const { guess } = body;

    const playerKey = session?.user?.id || body.playerKey;
    if (!playerKey || !guess) {
      return NextResponse.json({ ok: false, error: 'Missing guess or player identity' }, { status: 400 });
    }
    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      return NextResponse.json({ ok: false, error: 'Invalid match ID' }, { status: 400 });
    }

    const match = await Match.findById(matchId);
    if (!match || match.status !== 'active') {
      return NextResponse.json({ ok: false, error: 'Match not active' }, { status: 400 });
    }

    const playerResult = match.results.find(r => r.playerKey === playerKey);
    if (!playerResult) {
      return NextResponse.json({ ok: false, error: 'You are not in this match' }, { status: 403 });
    }
    if (playerResult.finished) {
      return NextResponse.json({ ok: false, error: 'You have already finished this match' }, { status: 400 });
    }

    // Fetch private content for answer checking
    const matchCase = await MatchCase.findById(match.matchCaseId)
      .select('contentPrivate')
      .lean();
    if (!matchCase) {
      return NextResponse.json({ ok: false, error: 'Match case not found' }, { status: 404 });
    }

    const priv = matchCase.contentPrivate;
    const matchResult = isCorrectGuess(guess, priv.diagnosis, priv.aliases, priv.acceptRules);
    const isCorrect = matchResult.ok;
    const normalizedGuessStr = guess.toLowerCase().trim();

    playerResult.guesses.push(guess);

    if (isCorrect) {
      playerResult.finished = true;
      playerResult.solvedAt = new Date();

      // Calculate score
      const room = await Room.findById(match.roomId).select('settings.mode').lean();
      const mode = (room?.settings?.mode as any) || 'race';
      const solveTimeMs = match.startedAt ? Date.now() - match.startedAt.getTime() : 0;

      // Count any LockTax penalties
      const lockTaxCount = match.sabotageEvents.filter(
        e => e.toPlayerKey === playerKey && e.type === 'LockTax'
      ).length;

      playerResult.score = calculateScore(mode, {
        layersUsed: playerResult.layersUsed,
        wrongGuesses: playerResult.wrongGuesses,
        solveTimeMs,
        lockTaxPenalty: lockTaxCount,
      });
    } else {
      playerResult.wrongGuesses += 1;

      if (playerResult.layersUsed < MAX_LAYERS) {
        playerResult.layersUsed += 1;
      } else {
        // All layers used, player failed
        playerResult.finished = true;
        playerResult.score = 9999; // Max penalty
      }
    }

    // Check if all players finished
    const allFinished = match.results.every(r => r.finished);
    if (allFinished) {
      match.status = 'ended';
      match.endedAt = new Date();

      // Update room status
      await Room.updateOne({ _id: match.roomId }, { $set: { status: 'ended' } });
    }

    await match.save();

    // Build response
    const response: any = {
      ok: true,
      correct: isCorrect,
      normalizedGuess: normalizedGuessStr,
      matchMethod: matchResult.method,
      finished: playerResult.finished,
      nextLayerIndex: playerResult.layersUsed - 1,
      score: playerResult.score,
      matchEnded: allFinished,
    };

    // Only reveal diagnosis if this player is finished
    if (playerResult.finished) {
      response.reveal = {
        diagnosis: priv.diagnosis,
        rationale: priv.answerCheck?.rationale,
        keyDifferentials: priv.answerCheck?.keyDifferentials,
        teachingPoints: priv.teachingPoints,
      };
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error processing party guess:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
