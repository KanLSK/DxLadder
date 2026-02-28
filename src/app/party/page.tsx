'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Swords, Users, Sparkles, Play, Loader2, BrainCircuit, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const SYSTEM_OPTIONS = [
  { id: 'Random', label: '🎲 Random' },
  { id: 'Cardiovascular', label: 'Cardiovascular' },
  { id: 'Respiratory', label: 'Respiratory' },
  { id: 'Neurology', label: 'Neurology' },
  { id: 'Gastrointestinal', label: 'GI' },
  { id: 'Renal', label: 'Renal / KUB' },
  { id: 'Endocrine', label: 'Endocrine' },
  { id: 'Hematology', label: 'Hematology' },
  { id: 'Infectious Disease', label: 'Infectious' },
];

export default function PartyLandingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [mode, setMode] = useState<'idle' | 'create' | 'join'>('idle');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinKey, setJoinKey] = useState('');
  const [joinError, setJoinError] = useState('');

  // Create room settings
  const [settings, setSettings] = useState({
    systemTags: ['Random'] as string[],
    difficulty: 3,
    style: 'apk',
    mode: 'race' as 'race' | 'efficiency' | 'hybrid',
    sabotage: 'off' as 'off' | 'light' | 'normal',
  });

  const handleSystemToggle = (sysId: string) => {
    setSettings(prev => {
      if (sysId === 'Random') return { ...prev, systemTags: ['Random'] };
      let next = prev.systemTags.filter(t => t !== 'Random');
      if (next.includes(sysId)) next = next.filter(t => t !== sysId);
      else next = [...next, sysId];
      if (next.length === 0) next = ['Random'];
      return { ...prev, systemTags: next };
    });
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/party/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            generationParams: {
              systemTags: settings.systemTags,
              difficulty: settings.difficulty,
              style: settings.style,
            },
            mode: settings.mode,
            sabotage: settings.sabotage,
          },
        }),
      });
      const data = await res.json();
      if (data.ok) {
        router.push(`/party/room/${data.roomId}`);
      }
    } catch (err) {
      console.error('Failed to create room:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async () => {
    if (!joinKey.trim()) return;
    setJoining(true);
    setJoinError('');
    try {
      const res = await fetch('/api/party/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomKey: joinKey.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (data.ok) {
        router.push(`/party/room/${data.roomId}`);
      } else {
        setJoinError(data.error || 'Failed to join');
      }
    } catch (err) {
      setJoinError('Network error');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold uppercase tracking-widest mb-6">
          <Swords className="w-3.5 h-3.5" />
          Party Mode
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          Race to Diagnose
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto">
          Compete with friends on a freshly-generated clinical case. Same case, same clock, different strategies.
        </p>
      </div>

      {/* Action Cards */}
      {mode === 'idle' && (
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Create Room */}
          <button
            onClick={() => setMode('create')}
            className="group bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm hover:border-indigo-500/50 hover:shadow-lg transition-all text-left"
          >
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Sparkles className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Create Room</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Set case parameters, game mode, and invite friends with a code.
            </p>
          </button>

          {/* Join Room */}
          <button
            onClick={() => setMode('join')}
            className="group bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm hover:border-emerald-500/50 hover:shadow-lg transition-all text-left"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Join Room</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Enter a room code to join a friend's match.
            </p>
          </button>
        </div>
      )}

      {/* Create Room Form */}
      {mode === 'create' && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg"><BrainCircuit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /></div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Room Settings</h2>
          </div>

          <div className="space-y-5">
            {/* System Tags */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2">System / Topic</label>
              <div className="flex flex-wrap gap-2">
                {SYSTEM_OPTIONS.map(sys => (
                  <button
                    key={sys.id}
                    onClick={() => handleSystemToggle(sys.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                      settings.systemTags.includes(sys.id)
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-400 hover:border-indigo-400"
                    )}
                  >
                    {sys.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2 flex justify-between">
                <span>Difficulty</span><span className="text-indigo-500">Tier {settings.difficulty}</span>
              </label>
              <input type="range" min="1" max="5" value={settings.difficulty} onChange={e => setSettings(s => ({ ...s, difficulty: +e.target.value }))} className="w-full accent-indigo-600" />
            </div>

            {/* Style */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Case Style</label>
              <select value={settings.style} onChange={e => setSettings(s => ({ ...s, style: e.target.value }))} className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm">
                <option value="apk">APK (Long form)</option>
                <option value="vignette">Vignette (Short)</option>
                <option value="osce">OSCE (Skills)</option>
              </select>
            </div>

            {/* Game Mode */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Game Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {(['race', 'efficiency', 'hybrid'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setSettings(s => ({ ...s, mode: m }))}
                    className={cn(
                      "py-2.5 rounded-lg text-xs font-bold border transition-all capitalize",
                      settings.mode === m
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                        : "bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-400"
                    )}
                  >
                    {m === 'race' && '⚡'} {m === 'efficiency' && '🎯'} {m === 'hybrid' && '🔀'} {m}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                {settings.mode === 'race' ? 'Speed matters — fastest diagnosis wins.' : settings.mode === 'efficiency' ? 'Fewest layers + guesses wins. No time pressure.' : 'Balanced mix of speed + efficiency.'}
              </p>
            </div>

            {/* Sabotage */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2 flex items-center gap-2">
                <Zap className="w-3 h-3" /> Sabotage
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['off', 'light', 'normal'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSettings(prev => ({ ...prev, sabotage: s }))}
                    className={cn(
                      "py-2.5 rounded-lg text-xs font-bold border transition-all capitalize",
                      settings.sabotage === s
                        ? "bg-rose-600 text-white border-transparent"
                        : "bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-400"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800">
            <button onClick={() => setMode('idle')} className="px-6 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Cancel</button>
            <button onClick={handleCreate} disabled={creating} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
              {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : <><Play className="w-4 h-4 fill-current" /> Create Room</>}
            </button>
          </div>
        </div>
      )}

      {/* Join Room Form */}
      {mode === 'join' && (
        <div className="max-w-md mx-auto bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm animate-in fade-in duration-300">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Enter Room Code</h2>
          <input
            type="text"
            maxLength={6}
            value={joinKey}
            onChange={e => { setJoinKey(e.target.value.toUpperCase()); setJoinError(''); }}
            placeholder="ABC123"
            className="w-full text-center text-3xl font-mono font-black tracking-[0.5em] bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl py-4 px-4 uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            autoFocus
          />
          {joinError && <p className="text-sm text-rose-500 font-semibold mt-3 text-center">{joinError}</p>}
          <div className="flex gap-3 mt-6">
            <button onClick={() => setMode('idle')} className="px-6 py-3 text-sm font-bold text-slate-600 dark:text-slate-400">Cancel</button>
            <button onClick={handleJoin} disabled={joining || joinKey.length < 3} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
              {joining ? <><Loader2 className="w-4 h-4 animate-spin" /> Joining…</> : <><Users className="w-4 h-4" /> Join Room</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
