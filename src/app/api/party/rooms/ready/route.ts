import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Room from '@/models/Room';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const session = await auth();
    const body = await request.json();
    const { roomId } = body;

    const playerKey = session?.user?.id || body.playerKey;
    if (!playerKey || !roomId) {
      return NextResponse.json({ ok: false, error: 'Missing roomId or player identity' }, { status: 400 });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json({ ok: false, error: 'Room not found' }, { status: 404 });
    }

    const player = room.players.find(p => p.playerKey === playerKey);
    if (!player) {
      return NextResponse.json({ ok: false, error: 'You are not in this room' }, { status: 403 });
    }

    player.ready = !player.ready;
    await room.save();

    return NextResponse.json({ ok: true, ready: player.ready });
  } catch (error: any) {
    console.error('Error toggling ready:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
