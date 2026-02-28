import { NextResponse } from 'next/server';
import { getPusherServer } from '@/lib/pusher';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.text();
    const params = new URLSearchParams(body);
    const socketId = params.get('socket_id');
    const channelName = params.get('channel_name');

    if (!socketId || !channelName) {
      return NextResponse.json({ error: 'Missing socket_id or channel_name' }, { status: 400 });
    }

    const pusher = getPusherServer();

    // Authorize the user for the private channel
    // Channel format: private-room-{id}, private-match-{id}, private-team-{matchId}-{teamId}, private-queue-{userId}
    const authResponse = pusher.authorizeChannel(socketId, channelName);

    return NextResponse.json(authResponse);
  } catch (error: any) {
    console.error('Pusher auth error:', error);
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 });
  }
}
