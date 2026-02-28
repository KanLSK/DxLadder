'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Copy, Check, Loader2, Users, Crown, Play, Sparkles, BrainCircuit, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const GENERATION_STEPS = [
  'Planning case structure',
  'Writing Presentation & HPI',
  'Building Physical Exam',
  'Generating Labs & Imaging',
  'Creating differentials + teaching points',
  'Packaging into DxLadder format',
  'Running critic validation',
];

export default function PartyRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const roomId = params.roomId as string;

  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [error, setError] = useState('');

  const playerKey = session?.user?.id;

  const fetchRoom = useCallback(async () => {
    try {
      const res = await fetch(`/api/party/rooms/${roomId}/state`);
      const data = await res.json();
      if (data.ok) {
        setRoom(data.room);

        // If match started, redirect to match page
        if (data.room.status === 'in_match' && data.room.currentMatchId) {
          router.push(`/party/match/${data.room.currentMatchId}`);
        }
      }
    } catch (err) {
      console.error('Failed to fetch room:', err);
    } finally {
      setLoading(false);
    }
  }, [roomId, router]);

  // Poll room state every 1s
  useEffect(() => {
    fetchRoom();
    const interval = setInterval(fetchRoom, 1000);
    return () => clearInterval(interval);
  }, [fetchRoom]);

  // Simulate generation steps
  useEffect(() => {
    if (room?.status !== 'generating') return;
    const timer = setInterval(() => {
      setGenStep(prev => (prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(timer);
  }, [room?.status]);

  const handleReady = async () => {
    await fetch('/api/party/rooms/ready', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId }),
    });
  };

  const handleStart = async () => {
    setStarting(true);
    setError('');
    setGenStep(0);
    try {
      const res = await fetch('/api/party/rooms/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId }),
      });
      const data = await res.json();
      if (data.ok) {
        router.push(`/party/match/${data.matchId}`);
      } else {
        setError(data.error || 'Failed to start');
        setStarting(false);
      }
    } catch (err) {
      setError('Network error');
      setStarting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(room?.roomKey || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <div className="text-sm font-bold uppercase tracking-widest text-slate-400 animate-pulse">Joining room…</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Room not found</h2>
        <button onClick={() => router.push('/party')} className="text-indigo-600 hover:underline font-semibold">Back to Party</button>
      </div>
    );
  }

  const isHost = playerKey === room.hostKey;
  const allReady = room.players.every((p: any) => p.ready || p.playerKey === room.hostKey);

  // --- GENERATING STATE ---
  if (room.status === 'generating' || starting) {
    return (
      <div className="max-w-xl mx-auto animate-in fade-in duration-500">
        <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-slate-200 dark:border-zinc-800 p-8 sm:p-10 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 rounded-2xl">
              <BrainCircuit className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Generating case…</h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                Gemini is synthesizing a fresh clinical chart for everyone.
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            {GENERATION_STEPS.map((step, idx) => {
              const isCompleted = idx < genStep;
              const isCurrent = idx === genStep;
              return (
                <div key={idx} className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-all duration-300",
                  isCurrent ? "bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30" : "opacity-50"
                )}>
                  <div className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full shrink-0 transition-colors",
                    isCompleted ? "bg-emerald-500 text-white" : isCurrent ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 animate-pulse" : "bg-slate-200 dark:bg-zinc-800"
                  )}>
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : isCurrent ? <div className="w-1.5 h-1.5 rounded-full bg-current" /> : null}
                  </div>
                  <span className={cn("text-sm font-bold", isCurrent ? "text-indigo-900 dark:text-indigo-100" : "text-slate-500")}>{step}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-center text-slate-400 font-medium">This typically takes 10–25 seconds.</p>
        </div>
      </div>
    );
  }

  // --- LOBBY STATE ---
  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Room Code */}
      <div className="text-center mb-10">
        <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Room Code</div>
        <button onClick={handleCopy} className="inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-[#18181B] border-2 border-dashed border-slate-300 dark:border-zinc-700 rounded-2xl hover:border-indigo-500 transition-colors group">
          <span className="text-4xl font-mono font-black tracking-[0.3em] text-slate-900 dark:text-white">{room.roomKey}</span>
          {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />}
        </button>
        <p className="text-xs text-slate-400 mt-2 font-medium">Share this code with friends to join</p>
      </div>

      {/* Player List */}
      <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" /> Players ({room.players.length}/8)
          </h3>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {room.settings.mode} mode
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
          {room.players.map((p: any) => {
            const isMe = p.playerKey === playerKey;
            const isPlayerHost = p.playerKey === room.hostKey;
            return (
              <div key={p.playerKey} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0",
                    isPlayerHost ? "bg-amber-500" : "bg-indigo-600"
                  )}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      {p.name} {isMe && <span className="text-[10px] text-slate-400">(you)</span>}
                      {isPlayerHost && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                    </div>
                  </div>
                </div>

                {isPlayerHost ? (
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-full">Host</span>
                ) : (
                  <span className={cn(
                    "text-xs font-bold px-2.5 py-1 rounded-full",
                    p.ready
                      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
                      : "text-slate-400 bg-slate-100 dark:bg-zinc-800"
                  )}>
                    {p.ready ? '✓ Ready' : 'Not Ready'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 text-center">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!isHost && (
          <button onClick={handleReady} className="flex-1 py-4 rounded-xl font-bold transition-all active:scale-95 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-2">
            <Check className="w-4 h-4" /> Toggle Ready
          </button>
        )}
        {isHost && (
          <button
            onClick={handleStart}
            disabled={starting}
            className="flex-1 py-4 rounded-xl font-bold transition-all active:scale-95 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-sm flex items-center justify-center gap-2"
          >
            {starting ? <><Loader2 className="w-4 h-4 animate-spin" /> Starting…</> : <><Play className="w-4 h-4 fill-current" /> Start Match</>}
          </button>
        )}
      </div>

      {/* Settings summary */}
      <div className="mt-8 p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-slate-200/60 dark:border-zinc-800/60">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Mode</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white capitalize">{room.settings.mode}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Style</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white uppercase">{room.settings.generationParams?.style || 'APK'}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Difficulty</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">Tier {room.settings.generationParams?.difficulty || 3}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Sabotage</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white capitalize">{room.settings.sabotage}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
