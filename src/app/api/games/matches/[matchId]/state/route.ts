import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import GameMatch from '@/models/GameMatch';
import mongoose from 'mongoose';

/**
 * GET - Match state polling fallback
 * Returns scoreboard without guess text (anti-cheat)
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    await dbConnect();
    const { matchId } = await params;

    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      return NextResponse.json({ ok: false, error: 'Invalid match ID' }, { status: 400 });
    }

    const match = await GameMatch.findById(matchId)
      .select('type mode teamSize status assignedParams players matchCaseId startedAt endedAt ratingChanges breakdown sabotageEvents eventSeq')
      .lean();

    if (!match) {
      return NextResponse.json({ ok: false, error: 'Match not found' }, { status: 404 });
    }

    const scoreboard = (match.players as any[]).map(p => ({
      userId: p.userId,
      name: p.name,
      teamId: p.teamId,
      score: p.score,
      layersUsed: p.layersUsed,
      wrongGuesses: p.wrongGuesses,
      finished: p.finished,
      solvedAt: p.solvedAt,
      sabotagesUsed: p.sabotagesUsed,
      connected: p.connected,
    }));

    return NextResponse.json({
      ok: true,
      match: {
        _id: match._id,
        type: match.type,
        mode: match.mode,
        teamSize: match.teamSize,
        status: match.status,
        assignedParams: match.assignedParams,
        startedAt: match.startedAt,
        endedAt: match.endedAt,
        matchCaseId: match.matchCaseId,
        scoreboard,
        ratingChanges: match.status === 'ended' ? match.ratingChanges : [],
        breakdown: match.status === 'ended' ? match.breakdown : undefined,
        sabotageEvents: match.sabotageEvents,
        eventSeq: match.eventSeq,
      },
    });
  } catch (error: any) {
    console.error('Game match state error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
