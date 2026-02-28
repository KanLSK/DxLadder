import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Room from '@/models/Room';
import { generateRoomKey } from '@/lib/partyUtils';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const session = await auth();
    const body = await request.json();
    const { settings } = body;

    const playerKey = session?.user?.id || body.playerKey;
    const playerName = session?.user?.displayName || session?.user?.name || body.playerName || 'Host';

    if (!playerKey) {
      return NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401 });
    }

    // Generate unique room key with retry
    let roomKey = generateRoomKey();
    let retries = 0;
    while (retries < 5) {
      const existing = await Room.findOne({ roomKey }).lean();
      if (!existing) break;
      roomKey = generateRoomKey();
      retries++;
    }

    const room = await Room.create({
      roomKey,
      status: 'lobby',
      hostKey: playerKey,
      settings: {
        generationParams: settings?.generationParams || {},
        mode: settings?.mode || 'race',
        sabotage: settings?.sabotage || 'off',
      },
      players: [{
        playerKey,
        name: playerName,
        ready: false,
        connected: true,
        joinedAt: new Date(),
      }],
    });

    return NextResponse.json({
      ok: true,
      roomId: room._id.toString(),
      roomKey: room.roomKey,
    });
  } catch (error: any) {
    console.error('Error creating room:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
