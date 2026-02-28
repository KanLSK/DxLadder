'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { usePusher } from '@/hooks/usePusher';
import { channels, events } from '@/lib/pusher';
import { Users, Crown, Loader2, Shield, Swords } from 'lucide-react';
import { RoomCodePanel } from '@/components/games/RoomCodePanel';
import { cn } from '@/lib/utils';

interface Player {
  userId: string;
  name: string;
  teamId?: string;
  ready: boolean;
  connected: boolean;
}

interface RoomState {
  roomKey: string;
  hostId: string;
  status: string;
  settings: {
    teamSize: number;
    difficulty: number;
    style: string;
    mode: string;
    sabotage: string;
  };
  players: Player[];
  currentMatchId?: string;
}

import { LoadingOverlay } from '@/components/games/LoadingOverlay';

const LOADING_TIPS = [
  "A raised JVP strongly suggests right-sided heart failure.",
  "Koplik spots are pathognomonic for measles.",
  "The triad of fever, neck stiffness, and altered mental status suggests meningitis.",
  "Pain radiating to the left shoulder (Kehr's sign) can indicate splenic rupture.",
  "An aura is experienced by about 20% of people with migraines.",
  "Charcot's neurologic triad: nystagmus, intention tremor, scanning speech (Multiple Sclerosis).",
  "Virchow's node (left supraclavicular) strongly suggests gastric cancer.",
  "The most common cause of community-acquired pneumonia is Streptococcus pneumoniae.",
  "A 'machine-like' murmur is characteristic of Patent Ductus Arteriosus (PDA).",
  "Hyperpigmentation of the palmar creases is a classic sign of Addison's disease."
];

export default function GameRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const roomId = params.roomId as string;
  const userId = session?.user?.id;

  const [room, setRoom] = useState<RoomState | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [currentTip, setCurrentTip] = useState(LOADING_TIPS[0]);

  // Rotate tips when starting or generating
  useEffect(() => {
    const isGenerating = starting || room?.status === 'generating';
    if (!isGenerating) return;
    
    // Set initial tip if we just entered generating
    setCurrentTip(LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)]);
    
    const interval = setInterval(() => {
      setCurrentTip(LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)]);
    }, 4000);
    return () => clearInterval(interval);
  }, [starting, room?.status]);

  const fetchRoom = useCallback(async () => {
    try {
      const res = await fetch(`/api/games/rooms/${roomId}`);
      const data = await res.json();
      if (data.ok) {
        setRoom(data.room);
        if (data.room.status === 'active' || data.room.status === 'countdown') {
          router.push(`/app/games/match/${data.room.currentMatchId}`);
        }
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [roomId, router]);

  useEffect(() => { fetchRoom(); }, [fetchRoom]);

  // Pusher realtime
  usePusher({
    channelName: channels.room(roomId),
    enabled: !!roomId,
    events: {
      [events.PLAYER_JOINED]: () => fetchRoom(),
      [events.PLAYER_LEFT]: () => fetchRoom(),
      [events.READY_CHANGED]: () => fetchRoom(),
      [events.ROOM_STATUS]: () => fetchRoom(),
      [events.CASE_READY]: (data: any) => {
        router.push(`/app/games/match/${data.matchId}`);
      },
    },
  });

  const handleReady = async () => {
    await fetch(`/api/games/rooms/${roomId}/ready`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    fetchRoom();
  };

  const handleStart = async () => {
    setStarting(true);
    setCurrentTip(LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)]);
    try {
      const res = await fetch(`/api/games/rooms/${roomId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.ok) {
        // Will be routed by Pusher or fallback fetchRoom
      }
    } catch {} 
  };

  if (loading || !room) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  const isHost = userId === room.hostId;
  const myPlayer = room.players.find(p => p.userId === userId);
  const allReady = room.players.length >= 2 && room.players.every(p => p.ready);
  const maxPlayers = room.settings.teamSize * 2;

  const modeLabels: Record<string, string> = { duel: 'Duel', economy: 'Economy', chaos: 'Chaos' };
  const tierTeams = room.settings.teamSize > 1;

  const isGenerating = starting || room.status === 'generating';

  return (
    <div className="max-w-xl mx-auto animate-in fade-in duration-500 pb-12">
      {/* Room code header */}
      <div className="mb-8">
        <RoomCodePanel 
          roomKey={room.roomKey} 
          playersCount={room.players.length} 
          maxPlayers={maxPlayers} 
        />
      </div>

      {/* Settings bar */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold">
          {room.settings.teamSize}v{room.settings.teamSize}
        </span>
        <span className="px-3 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 rounded-full text-xs font-bold">
          Difficulty {room.settings.difficulty}
        </span>
        <span className="px-3 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 rounded-full text-xs font-bold capitalize">
          {modeLabels[room.settings.mode] || room.settings.mode}
        </span>
        <span className="px-3 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 rounded-full text-xs font-bold capitalize">
          {room.settings.style}
        </span>
        {room.settings.sabotage !== 'off' && (
          <span className="px-3 py-1 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 rounded-full text-xs font-bold capitalize">
            Sabotage: {room.settings.sabotage}
          </span>
        )}
      </div>

      {/* Player list */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Players ({room.players.length}/{maxPlayers})
          </span>
          {room.status === 'generating' && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
              <Loader2 className="w-3 h-3 animate-spin" /> Generating case…
            </span>
          )}
        </div>

        {/* Slots */}
        {Array.from({ length: maxPlayers }).map((_, idx) => {
          const player = room.players[idx];
          if (!player) {
            return (
              <div key={idx} className="px-4 py-3 border-b border-slate-50 dark:border-zinc-800/50 flex items-center gap-3 opacity-30">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-800 border-2 border-dashed border-slate-300 dark:border-zinc-700" />
                <span className="text-sm text-slate-400 italic">Waiting for player…</span>
              </div>
            );
          }

          return (
            <div key={player.userId} className="px-4 py-3 border-b border-slate-50 dark:border-zinc-800/50 flex items-center gap-3">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold',
                player.userId === room.hostId ? 'bg-amber-500' : 'bg-indigo-500'
              )}>
                {player.userId === room.hostId ? <Crown className="w-4 h-4" /> : player.name[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{player.name}</span>
                  {player.userId === room.hostId && (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded">HOST</span>
                  )}
                  {tierTeams && player.teamId && (
                    <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded', player.teamId === 'A' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600')}>
                      Team {player.teamId}
                    </span>
                  )}
                </div>
              </div>
              <div className={cn(
                'px-2.5 py-1 rounded-full text-[10px] font-bold',
                player.ready
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-400'
              )}>
                {player.ready ? 'Ready' : 'Not Ready'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        {myPlayer && (
          <button
            onClick={handleReady}
            className={cn(
              'flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2',
              myPlayer.ready
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
            )}
          >
            <Shield className="w-4 h-4" />
            {myPlayer.ready ? 'Ready ✓' : 'Ready Up'}
          </button>
        )}

        {isHost && (
          <button
            onClick={handleStart}
            disabled={!allReady || isGenerating || room.status !== 'lobby'}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-zinc-800 text-white disabled:text-slate-400 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Swords className="w-4 h-4" />}
            {isGenerating ? 'Starting…' : 'Start Match'}
          </button>
        )}
      </div>

      <LoadingOverlay
        isOpen={isGenerating}
        title="Generating Case..."
        subtitle={currentTip}
        icon={<Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-6" />}
      />
    </div>
  );
}
