import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Match from '@/models/Match';
import mongoose from 'mongoose';

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

    const match = await Match.findById(matchId)
      .select('roomId status startedAt endedAt results sabotageEvents')
      .lean();

    if (!match) {
      return NextResponse.json({ ok: false, error: 'Match not found' }, { status: 404 });
    }

    // Never leak guess text to other players — only expose aggregate stats
    const scoreboard = match.results.map(r => ({
      playerKey: r.playerKey,
      name: r.name,
      score: r.score,
      layersUsed: r.layersUsed,
      wrongGuesses: r.wrongGuesses,
      finished: r.finished,
      solvedAt: r.solvedAt || null,
      sabotagesUsed: r.sabotagesUsed,
    }));

    return NextResponse.json({
      ok: true,
      match: {
        _id: match._id,
        roomId: match.roomId,
        status: match.status,
        startedAt: match.startedAt,
        endedAt: match.endedAt,
        scoreboard,
        sabotageEvents: match.sabotageEvents,
      },
    });
  } catch (error: any) {
    console.error('Error fetching match state:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
