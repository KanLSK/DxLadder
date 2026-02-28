import Pusher from 'pusher';
import PusherClient from 'pusher-js';

// ──────────────────────────────────────────
// SERVER-SIDE Pusher instance (API routes)
// ──────────────────────────────────────────
let pusherServer: Pusher | null = null;

export function getPusherServer(): Pusher {
  if (!pusherServer) {
    pusherServer = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      useTLS: true,
    });
  }
  return pusherServer;
}

// ──────────────────────────────────────────
// CLIENT-SIDE Pusher instance (React)
// ──────────────────────────────────────────
let pusherClient: PusherClient | null = null;

export function getPusherClient(): PusherClient {
  if (typeof window === 'undefined') {
    throw new Error('getPusherClient() can only be called on the client');
  }
  if (!pusherClient) {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY || 'dummy_key';
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2';
    
    // Only instantiate if we actually have a real key configured, 
    // otherwise provide a dummy instance to prevent React from crashing
    if (key === 'dummy_key') {
       console.warn('Pusher is not configured. Missing NEXT_PUBLIC_PUSHER_KEY.');
    }
    
    pusherClient = new PusherClient(
      key,
      {
        cluster: cluster,
        authEndpoint: '/api/games/pusher-auth',
      }
    );
  }
  return pusherClient;
}

// ──────────────────────────────────────────
// Channel name helpers
// ──────────────────────────────────────────
export const channels = {
  room: (roomId: string) => `private-room-${roomId}`,
  match: (matchId: string) => `private-match-${matchId}`,
  team: (matchId: string, teamId: string) => `private-team-${matchId}-${teamId}`,
  queue: (userId: string) => `private-queue-${userId}`,
} as const;

// ──────────────────────────────────────────
// Event name constants
// ──────────────────────────────────────────
export const events = {
  // Room events
  PLAYER_JOINED: 'player-joined',
  PLAYER_LEFT: 'player-left',
  READY_CHANGED: 'ready-changed',
  ROOM_STATUS: 'room-status',

  // Match events
  MATCH_GENERATING: 'match-generating',
  CASE_READY: 'case-ready',
  COUNTDOWN: 'countdown',
  MATCH_STARTED: 'match-started',
  PLAYER_PROGRESS: 'player-progress',
  PLAYER_SOLVED: 'player-solved',
  SCORE_UPDATED: 'score-updated',
  MATCH_ENDED: 'match-ended',

  // Ranked queue events
  QUEUE_MATCHED: 'queue-matched',
  QUEUE_STATUS: 'queue-status',

  // Team events
  TEAM_CHAT: 'team-chat',
} as const;
