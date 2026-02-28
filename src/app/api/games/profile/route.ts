import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import RankedProfile from '@/models/RankedProfile';
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

    const profile = await RankedProfile.findOne({ userId }).lean();
    if (!profile) {
      return NextResponse.json({ ok: true, profile: null, recentMatches: [] });
    }

    // Fetch last 5 matches
    const matches = await GameMatch.find({
      'players.userId': userId,
      status: 'ended',
    })
      .sort({ endedAt: -1 })
      .limit(5)
      .select('type mode players ratingChanges endedAt assignedParams')
      .lean();

    const recentMatches = matches.map((m: any) => {
      const me = m.players.find((p: any) => p.userId === userId);
      const opponent = m.players.find((p: any) => p.userId !== userId);
      const myRatingChange = m.ratingChanges?.find((rc: any) => rc.userId === userId);

      return {
        _id: m._id,
        type: m.type,
        mode: m.mode,
        opponent: opponent?.name || 'Unknown',
        won: me?.solvedAt ? (!opponent?.solvedAt || new Date(me.solvedAt) <= new Date(opponent.solvedAt)) : false,
        myScore: me?.score || 0,
        opponentScore: opponent?.score || 0,
        ratingDelta: myRatingChange?.delta,
        endedAt: m.endedAt,
        difficulty: m.assignedParams?.difficulty,
      };
    });

    return NextResponse.json({ ok: true, profile, recentMatches });
  } catch (error: any) {
    console.error('Profile error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
