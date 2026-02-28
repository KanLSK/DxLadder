import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import RankedProfile from '@/models/RankedProfile';

export async function GET() {
  try {
    await dbConnect();

    const top100 = await RankedProfile.find()
      .sort({ rating: -1 })
      .limit(100)
      .select('alias rating tier wins losses matchesPlayed winStreak bestStreak')
      .lean();

    const leaderboard = top100.map((p: any, idx: number) => ({
      rank: idx + 1,
      alias: p.alias,
      rating: p.rating,
      tier: p.tier,
      wins: p.wins,
      losses: p.losses,
      matchesPlayed: p.matchesPlayed,
      winRate: p.matchesPlayed > 0 ? Math.round((p.wins / p.matchesPlayed) * 100) : 0,
    }));

    return NextResponse.json({ ok: true, leaderboard });
  } catch (error: any) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
