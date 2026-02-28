import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import GameMatch from '@/models/GameMatch';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    await dbConnect();
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Auth required' }, { status: 401 });
    }

    const matches = await GameMatch.find({
      'players.userId': userId,
      status: 'ended',
    })
      .sort({ endedAt: -1 })
      .limit(50)
      .select('type mode teamSize players ratingChanges endedAt assignedParams')
      .lean();

    const result = matches.map((m: any) => {
      const me = m.players.find((p: any) => p.userId === userId);
      const opponent = m.players.find((p: any) => p.userId !== userId);
      const myRC = m.ratingChanges?.find((rc: any) => rc.userId === userId);

      const won = me?.solvedAt
        ? (!opponent?.solvedAt || new Date(me.solvedAt) <= new Date(opponent.solvedAt))
        : false;

      return {
        _id: m._id,
        type: m.type,
        mode: m.mode,
        opponent: opponent?.name || 'Unknown',
        won,
        myScore: me?.score || 0,
        opponentScore: opponent?.score || 0,
        ratingDelta: myRC?.delta,
        endedAt: m.endedAt,
        difficulty: m.assignedParams?.difficulty,
      };
    });

    return NextResponse.json({ ok: true, matches: result });
  } catch (error: any) {
    console.error('History error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
