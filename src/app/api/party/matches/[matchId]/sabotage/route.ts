import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Match from '@/models/Match';
import { auth } from '@/lib/auth';
import { MAX_SABOTAGES_PER_PLAYER, SABOTAGE_DURATIONS, SabotageType } from '@/lib/partyUtils';
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
    const { type, targetPlayerKey } = body;

    const playerKey = session?.user?.id || body.playerKey;
    if (!playerKey || !type || !targetPlayerKey) {
      return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
    }
    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      return NextResponse.json({ ok: false, error: 'Invalid match ID' }, { status: 400 });
    }

    const validTypes: SabotageType[] = ['FogOfWar', 'JammedSubmit', 'SwapFocus', 'LockTax'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ ok: false, error: 'Invalid sabotage type' }, { status: 400 });
    }

    // Can't sabotage yourself
    if (playerKey === targetPlayerKey) {
      return NextResponse.json({ ok: false, error: 'Cannot sabotage yourself' }, { status: 400 });
    }

    const match = await Match.findById(matchId);
    if (!match || match.status !== 'active') {
      return NextResponse.json({ ok: false, error: 'Match not active' }, { status: 400 });
    }

    // Check player is in match
    const attacker = match.results.find(r => r.playerKey === playerKey);
    if (!attacker) {
      return NextResponse.json({ ok: false, error: 'You are not in this match' }, { status: 403 });
    }

    // Check sabotage limit
    const usedCount = match.sabotageEvents.filter(e => e.fromPlayerKey === playerKey).length;
    if (usedCount >= MAX_SABOTAGES_PER_PLAYER) {
      return NextResponse.json({ ok: false, error: `Max ${MAX_SABOTAGES_PER_PLAYER} sabotages per match` }, { status: 400 });
    }

    // Check target exists and isn't finished
    const target = match.results.find(r => r.playerKey === targetPlayerKey);
    if (!target) {
      return NextResponse.json({ ok: false, error: 'Target player not found' }, { status: 400 });
    }
    if (target.finished) {
      return NextResponse.json({ ok: false, error: 'Target player already finished' }, { status: 400 });
    }

    // Fire sabotage
    match.sabotageEvents.push({
      type,
      fromPlayerKey: playerKey,
      toPlayerKey: targetPlayerKey,
      firedAt: new Date(),
      duration: SABOTAGE_DURATIONS[type as SabotageType],
    });

    attacker.sabotagesUsed += 1;
    await match.save();

    return NextResponse.json({
      ok: true,
      sabotage: {
        type,
        targetPlayerKey,
        duration: SABOTAGE_DURATIONS[type as SabotageType],
      },
    });
  } catch (error: any) {
    console.error('Error firing sabotage:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
