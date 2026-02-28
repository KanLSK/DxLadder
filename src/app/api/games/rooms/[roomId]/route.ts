import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import GameRoom from '@/models/GameRoom';
import mongoose from 'mongoose';

/**
 * GET room state (lobby polling fallback)
 */
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

    const room = await GameRoom.findById(roomId)
      .select('roomKey type hostId status settings players currentMatchId createdAt')
      .lean();

    if (!room) {
      return NextResponse.json({ ok: false, error: 'Room not found' }, { status: 404 });
    }

    // Strip session tokens from player list (security)
    const players = room.players.map((p: any) => ({
      userId: p.userId,
      name: p.name,
      teamId: p.teamId,
      ready: p.ready,
      connected: p.connected,
    }));

    return NextResponse.json({
      ok: true,
      room: {
        _id: room._id,
        roomKey: room.roomKey,
        type: room.type,
        hostId: room.hostId,
        status: room.status,
        settings: room.settings,
        players,
        currentMatchId: room.currentMatchId,
      },
    });
  } catch (error: any) {
    console.error('Error fetching game room:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
