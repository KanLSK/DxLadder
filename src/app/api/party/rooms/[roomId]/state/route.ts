import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Room from '@/models/Room';
import mongoose from 'mongoose';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await dbConnect();
    const { roomId } = await params;

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return NextResponse.json({ ok: false, error: 'Invalid room ID' }, { status: 400 });
    }

    const room = await Room.findById(roomId)
      .select('roomKey status hostKey players settings currentMatchId createdAt')
      .lean();

    if (!room) {
      return NextResponse.json({ ok: false, error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      room: {
        _id: room._id,
        roomKey: room.roomKey,
        status: room.status,
        hostKey: room.hostKey,
        settings: room.settings,
        currentMatchId: room.currentMatchId?.toString() || null,
        players: room.players.map(p => ({
          playerKey: p.playerKey,
          name: p.name,
          ready: p.ready,
          connected: p.connected,
        })),
        createdAt: room.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error fetching room state:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
