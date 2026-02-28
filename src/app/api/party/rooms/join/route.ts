import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Room from '@/models/Room';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const session = await auth();
    const body = await request.json();
    const { roomKey } = body;

    const playerKey = session?.user?.id || body.playerKey;
    const playerName = session?.user?.displayName || session?.user?.name || body.playerName || 'Player';

    if (!playerKey) {
      return NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401 });
    }
    if (!roomKey) {
      return NextResponse.json({ ok: false, error: 'Room key is required' }, { status: 400 });
    }

    const room = await Room.findOne({ roomKey: roomKey.toUpperCase() });
    if (!room) {
      return NextResponse.json({ ok: false, error: 'Room not found. Check the code and try again.' }, { status: 404 });
    }
    if (room.status !== 'lobby') {
      return NextResponse.json({ ok: false, error: 'This room is no longer accepting players.' }, { status: 400 });
    }

    // Check if player already in room
    const alreadyJoined = room.players.some(p => p.playerKey === playerKey);
    if (alreadyJoined) {
      return NextResponse.json({ ok: true, roomId: room._id.toString(), message: 'Already in this room' });
    }

    // Max 8 players
    if (room.players.length >= 8) {
      return NextResponse.json({ ok: false, error: 'Room is full (max 8 players).' }, { status: 400 });
    }

    room.players.push({
      playerKey,
      name: playerName,
      ready: false,
      connected: true,
      joinedAt: new Date(),
    });
    await room.save();

    return NextResponse.json({ ok: true, roomId: room._id.toString() });
  } catch (error: any) {
    console.error('Error joining room:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
