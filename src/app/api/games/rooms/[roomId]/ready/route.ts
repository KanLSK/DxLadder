import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import GameRoom from '@/models/GameRoom';
import { auth } from '@/lib/auth';
import { getPusherServer, channels, events } from '@/lib/pusher';
import mongoose from 'mongoose';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await dbConnect();
    const session = await auth();
    const { roomId } = await params;

    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Auth required' }, { status: 401 });
    }
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return NextResponse.json({ ok: false, error: 'Invalid room ID' }, { status: 400 });
    }

    const room = await GameRoom.findById(roomId);
    if (!room || room.status !== 'lobby') {
      return NextResponse.json({ ok: false, error: 'Room not in lobby' }, { status: 400 });
    }

    const player = room.players.find(p => p.userId === userId);
    if (!player) {
      return NextResponse.json({ ok: false, error: 'Not in room' }, { status: 403 });
    }

    player.ready = !player.ready;
    await room.save();

    // Broadcast
    const pusher = getPusherServer();
    await pusher.trigger(channels.room(roomId), events.READY_CHANGED, {
      userId,
      ready: player.ready,
      allReady: room.players.every(p => p.ready),
    });

    return NextResponse.json({
      ok: true,
      ready: player.ready,
      allReady: room.players.every(p => p.ready),
    });
  } catch (error: any) {
    console.error('Error toggling ready:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
