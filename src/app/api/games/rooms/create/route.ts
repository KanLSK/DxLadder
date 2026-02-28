import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import GameRoom from '@/models/GameRoom';
import { generateRoomKey } from '@/lib/partyUtils';
import { auth } from '@/lib/auth';
import { randomBytes } from 'crypto';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const session = await auth();
    const body = await request.json();

    const userId = session?.user?.id;
    const playerName = session?.user?.displayName || session?.user?.name || 'Host';

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401 });
    }

    const { settings } = body;

    // Generate unique room key
    let roomKey = generateRoomKey();
    for (let i = 0; i < 5; i++) {
      const existing = await GameRoom.findOne({ roomKey }).lean();
      if (!existing) break;
      roomKey = generateRoomKey();
    }

    const sessionToken = randomBytes(24).toString('hex');

    const room = await GameRoom.create({
      roomKey,
      type: 'friend',
      hostId: userId,
      status: 'lobby',
      settings: {
        teamSize: settings?.teamSize || 1,
        difficulty: Math.min(5, Math.max(1, settings?.difficulty || 3)),
        style: settings?.style || 'vignette',
        mode: settings?.mode || 'duel',
        sabotage: settings?.sabotage || 'off',
        generationParams: settings?.generationParams || {},
      },
      players: [{
        userId,
        name: playerName,
        ready: false,
        connected: true,
        joinedAt: new Date(),
        lastSeenAt: new Date(),
        sessionToken,
      }],
    });

    return NextResponse.json({
      ok: true,
      roomId: room._id.toString(),
      roomKey: room.roomKey,
      sessionToken,
    });
  } catch (error: any) {
    console.error('Error creating game room:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
