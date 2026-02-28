'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gavel, LogIn, Plus, ChevronRight } from 'lucide-react';
import { CreateRoomModal, RoomSettings } from '@/components/games/CreateRoomModal';
import Link from 'next/link';

export default function AuctionLobbyPage() {
  const router = useRouter();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [roomKey, setRoomKey] = useState('');
  const [joining, setJoining] = useState(false);
  const [creating, setCreating] = useState(false);

  const [settings, setSettings] = useState<RoomSettings>({
    teamSize: 1,
    difficulty: 3,
    style: 'vignette',
    mode: 'economy',
    sabotage: 'off',
  });

  const handleCreateRoom = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/games/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: { ...settings, mode: 'economy' } }),
      });
      const data = await res.json();
      if (data.ok) {
        localStorage.setItem(`session_${data.roomId}`, data.sessionToken);
        router.push(`/app/games/room/${data.roomId}`);
      }
    } catch {} finally {
      setCreating(false);
      setIsCreateOpen(false);
    }
  };

  const handleJoinRoom = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!roomKey.trim()) return;
    setJoining(true);
    try {
      const res = await fetch('/api/games/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomKey: roomKey.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        localStorage.setItem(`session_${data.roomId}`, data.sessionToken);
        router.push(`/app/games/room/${data.roomId}`);
      }
    } catch {} finally {
      setJoining(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-12">
      <div className="mb-10">
        <Link href="/app/games" className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors mb-4">
          <ChevronRight className="w-4 h-4 rotate-180 mr-1" /> Back to Arenas
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center shrink-0">
            <Gavel className="w-7 h-7 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Clue Auction</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Bid for clues. Bluff to win. Spend your credits wisely.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="group text-left p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl hover:border-emerald-300 dark:hover:border-emerald-500 transition-all shadow-sm hover:shadow-lg hover:-translate-y-1 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
            <Plus className="w-32 h-32 text-emerald-500" />
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 mb-6 dark:bg-emerald-500/20">
            <Plus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 relative z-10">Create Auction</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed relative z-10">
            Host a new auction room. 3-8 players recommended.
          </p>
        </button>

        <div className="p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <LogIn className="w-32 h-32 text-slate-900 dark:text-white" />
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-slate-400 mb-6 relative z-10">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 relative z-10">Join Auction</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed relative z-10 mb-6">
            Enter the 6-letter room code.
          </p>

          <form onSubmit={handleJoinRoom} className="flex gap-3 relative z-10">
            <input
              type="text"
              value={roomKey}
              onChange={(e) => setRoomKey(e.target.value.toUpperCase())}
              placeholder="CODE"
              maxLength={6}
              className="flex-1 min-w-0 bg-slate-100 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-4 font-mono font-black text-xl tracking-[0.3em] uppercase outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-center placeholder:tracking-normal placeholder:font-sans placeholder:text-base placeholder:font-medium placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={joining || roomKey.length < 4}
              className="px-6 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-zinc-900 font-bold transition-all disabled:opacity-50 hover:bg-emerald-600 dark:hover:bg-emerald-400 flex items-center justify-center shrink-0"
            >
              Join
            </button>
          </form>
        </div>
      </div>

      <CreateRoomModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Auction"
        settings={settings}
        onChange={setSettings}
        onConfirm={handleCreateRoom}
        fixedMode="economy" // Forces 'economy' mode
        isCreating={creating}
      />
    </div>
  );
}
