import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import GameRoom from '@/models/GameRoom';
import { auth } from '@/lib/auth';
import { getPusherServer, channels, events } from '@/lib/pusher';
import { randomBytes } from 'crypto';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const session = await auth();
    const body = await request.json();

    const userId = session?.user?.id;
    const playerName = session?.user?.displayName || session?.user?.name || 'Player';

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401 });
    }

    const { roomKey } = body;
    if (!roomKey) {
      return NextResponse.json({ ok: false, error: 'Room key is required' }, { status: 400 });
    }

    const room = await GameRoom.findOne({ roomKey: roomKey.toUpperCase() });
    if (!room) {
      return NextResponse.json({ ok: false, error: 'Room not found' }, { status: 404 });
    }
    if (room.status !== 'lobby') {
      return NextResponse.json({ ok: false, error: 'Room is no longer accepting players' }, { status: 400 });
    }

    // Already in room? Return existing session
    const existing = room.players.find(p => p.userId === userId);
    if (existing) {
      return NextResponse.json({
        ok: true,
        roomId: room._id.toString(),
        sessionToken: existing.sessionToken,
        message: 'Already in room',
      });
    }

    // Check capacity: teamSize determines max players
    // 1v1 = 2, 2v2 = 4, 4v4 = 8
    const maxPlayers = room.settings.teamSize * 2;
    if (room.players.length >= maxPlayers) {
      return NextResponse.json({ ok: false, error: `Room is full (${maxPlayers} max)` }, { status: 400 });
    }

    const sessionToken = randomBytes(24).toString('hex');

    // Auto-assign team for team modes
    let teamId: string | undefined;
    if (room.settings.teamSize > 1) {
      const teamACounts = room.players.filter(p => p.teamId === 'A').length;
      const teamBCounts = room.players.filter(p => p.teamId === 'B').length;
      teamId = teamACounts <= teamBCounts ? 'A' : 'B';
    }

    room.players.push({
      userId,
      name: playerName,
      teamId,
      ready: false,
      connected: true,
      joinedAt: new Date(),
      lastSeenAt: new Date(),
      sessionToken,
    });
    await room.save();

    // Broadcast via Pusher
    const pusher = getPusherServer();
    await pusher.trigger(channels.room(room._id.toString()), events.PLAYER_JOINED, {
      userId,
      name: playerName,
      teamId,
      playerCount: room.players.length,
    });

    return NextResponse.json({
      ok: true,
      roomId: room._id.toString(),
      sessionToken,
      teamId,
    });
  } catch (error: any) {
    console.error('Error joining game room:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
