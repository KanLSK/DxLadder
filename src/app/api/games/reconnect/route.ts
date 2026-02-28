import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import GameMatch from '@/models/GameMatch';
import GameRoom from '@/models/GameRoom';
import { auth } from '@/lib/auth';

/**
 * POST - Reconnect to active room/match
 * Returns current state snapshot + channels for Pusher resubscription
 */
export async function POST(request: Request) {
  try {
    await dbConnect();
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Auth required' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionToken } = body;

    // Find active match with this user
    const activeMatch = await GameMatch.findOne({
      'players.userId': userId,
      status: { $in: ['countdown', 'active'] },
    }).lean();

    if (activeMatch) {
      const player = (activeMatch.players as any[]).find(p => p.userId === userId);

      // Validate session token if provided
      if (sessionToken && player?.sessionToken !== sessionToken) {
        return NextResponse.json({
          ok: false,
          error: 'Session token mismatch — may be open in another tab',
        }, { status: 403 });
      }

      const scoreboard = (activeMatch.players as any[]).map(p => ({
        userId: p.userId,
        name: p.name,
        teamId: p.teamId,
        score: p.score,
        layersUsed: p.layersUsed,
        wrongGuesses: p.wrongGuesses,
        finished: p.finished,
        connected: p.connected,
      }));

      return NextResponse.json({
        ok: true,
        type: 'match',
        matchId: activeMatch._id!.toString(),
        matchType: activeMatch.type,
        mode: activeMatch.mode,
        status: activeMatch.status,
        matchCaseId: activeMatch.matchCaseId?.toString(),
        assignedParams: activeMatch.assignedParams,
        startedAt: activeMatch.startedAt,
        playerState: player ? {
          layersUsed: player.layersUsed,
          wrongGuesses: player.wrongGuesses,
          finished: player.finished,
          score: player.score,
        } : null,
        scoreboard,
        roomId: activeMatch.roomId?.toString(),
      });
    }

    // Check for active room (lobby)
    const activeRoom = await GameRoom.findOne({
      'players.userId': userId,
      status: { $in: ['lobby', 'generating', 'countdown'] },
    }).lean();

    if (activeRoom) {
      return NextResponse.json({
        ok: true,
        type: 'room',
        roomId: activeRoom._id!.toString(),
        roomKey: activeRoom.roomKey,
        status: activeRoom.status,
        currentMatchId: activeRoom.currentMatchId?.toString(),
      });
    }

    // Check for recently ended match (show results)
    const recentMatch = await GameMatch.findOne({
      'players.userId': userId,
      status: 'ended',
    })
      .sort({ endedAt: -1 })
      .limit(1)
      .lean();

    if (recentMatch) {
      return NextResponse.json({
        ok: true,
        type: 'ended',
        matchId: recentMatch._id!.toString(),
        message: 'Match has ended',
      });
    }

    return NextResponse.json({ ok: true, type: 'none', message: 'No active session' });
  } catch (error: any) {
    console.error('Reconnect error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
