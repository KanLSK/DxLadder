import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import RankedQueue from '@/models/RankedQueue';
import RankedProfile from '@/models/RankedProfile';
import { auth } from '@/lib/auth';
import { generateAlias } from '@/lib/elo';

/**
 * POST - Join ranked queue
 * DELETE - Leave ranked queue
 */
export async function POST(request: Request) {
  try {
    await dbConnect();
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Auth required' }, { status: 401 });
    }

    // Get or create ranked profile
    let profile = await RankedProfile.findOne({ userId });
    if (!profile) {
      profile = await RankedProfile.create({
        userId,
        alias: generateAlias(),
        rating: 1200,
        tier: 'Silver',
      });
    }

    // Check if already in queue
    const existing = await RankedQueue.findOne({ userId });
    if (existing) {
      if (existing.status === 'matched' && existing.matchId) {
        return NextResponse.json({
          ok: true,
          status: 'matched',
          matchId: existing.matchId.toString(),
        });
      }
      return NextResponse.json({ ok: true, status: 'waiting', message: 'Already in queue' });
    }

    await RankedQueue.create({
      userId,
      rating: profile.rating,
      status: 'waiting',
    });

    return NextResponse.json({
      ok: true,
      status: 'waiting',
      rating: profile.rating,
      tier: profile.tier,
    });
  } catch (error: any) {
    console.error('Ranked queue join error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Auth required' }, { status: 401 });
    }

    await RankedQueue.deleteOne({ userId, status: 'waiting' });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Ranked queue leave error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
