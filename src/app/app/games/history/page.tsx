'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Trophy, Swords, Filter, Loader2, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HistoryPage() {
  const { data: session } = useSession();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'ranked' | 'friend'>('all');

  useEffect(() => {
    if (!session?.user?.id) return;
    fetchHistory();
  }, [session]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/games/history');
      const data = await res.json();
      if (data.ok) setMatches(data.matches);
    } catch {} finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'all' ? matches : matches.filter(m => m.type === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Swords className="w-6 h-6 text-indigo-500" /> Match History
        </h1>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'ranked', 'friend'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-1.5 rounded-full text-xs font-bold transition-all capitalize',
              filter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-slate-700'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Match list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No matches yet. Go play!</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
          {filtered.map((m: any) => (
            <Link
              key={m._id}
              href={`/app/games/match/${m._id}/breakdown`}
              className="block px-4 py-4 border-b border-slate-50 dark:border-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                {/* Result badge */}
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0',
                  m.won ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600'
                )}>
                  {m.won ? 'W' : 'L'}
                </div>

                {/* Match info */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-slate-900 dark:text-white mb-0.5">
                    vs. {m.opponent}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className={cn(
                      'px-1.5 py-0.5 rounded font-bold',
                      m.type === 'ranked' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600'
                    )}>
                      {m.type}
                    </span>
                    <span>{m.mode}</span>
                    <span>Diff {m.difficulty}</span>
                    <span>{new Date(m.endedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Score + delta */}
                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                    {m.myScore} - {m.opponentScore}
                  </div>
                  {m.ratingDelta !== undefined && (
                    <div className={cn(
                      'text-xs font-bold flex items-center justify-end gap-0.5',
                      m.ratingDelta > 0 ? 'text-emerald-600' : 'text-rose-600'
                    )}>
                      {m.ratingDelta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {m.ratingDelta > 0 ? '+' : ''}{m.ratingDelta}
                    </div>
                  )}
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
