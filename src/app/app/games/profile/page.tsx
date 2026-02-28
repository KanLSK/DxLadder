'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Trophy, TrendingUp, Swords, Flame, Shield, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const tierColors: Record<string, { bg: string; text: string; border: string }> = {
  Bronze:  { bg: 'bg-amber-50 dark:bg-amber-900/10', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-300 dark:border-amber-700' },
  Silver:  { bg: 'bg-slate-50 dark:bg-zinc-800', text: 'text-slate-500', border: 'border-slate-300 dark:border-zinc-700' },
  Gold:    { bg: 'bg-yellow-50 dark:bg-yellow-900/10', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-300 dark:border-yellow-700' },
  Diamond: { bg: 'bg-cyan-50 dark:bg-cyan-900/10', text: 'text-cyan-700 dark:text-cyan-400', border: 'border-cyan-300 dark:border-cyan-700' },
  Master:  { bg: 'bg-purple-50 dark:bg-purple-900/10', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-300 dark:border-purple-700' },
};

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/games/profile');
        const data = await res.json();
        if (data.ok) {
          setProfile(data.profile);
          setRecentMatches(data.recentMatches || []);
        }
      } catch {} finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Ranked Profile Yet</h2>
        <p className="text-sm text-slate-500">Play a ranked match to create your profile.</p>
      </div>
    );
  }

  const tc = tierColors[profile.tier] || tierColors.Bronze;
  const winRate = profile.matchesPlayed > 0 ? Math.round((profile.wins / profile.matchesPlayed) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
      {/* Profile header */}
      <div className={cn('rounded-2xl border p-6 mb-6', tc.bg, tc.border)}>
        <div className="flex items-center gap-4">
          <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center', tc.bg)}>
            <Trophy className={cn('w-8 h-8', tc.text)} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{profile.alias}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={cn('font-bold text-sm', tc.text)}>{profile.tier}</span>
              <span className="font-mono text-lg font-bold text-slate-900 dark:text-white">{profile.rating}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard icon={<Swords className="w-4 h-4" />} label="Matches" value={profile.matchesPlayed} />
        <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Win Rate" value={`${winRate}%`} />
        <StatCard icon={<Trophy className="w-4 h-4" />} label="W / L" value={`${profile.wins} / ${profile.losses}`} />
        <StatCard icon={<Flame className="w-4 h-4" />} label="Best Streak" value={profile.bestStreak} />
      </div>

      {/* Recent matches */}
      {recentMatches.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Recent Matches</h3>
          </div>
          {recentMatches.map((m: any) => (
            <a key={m._id} href={`/app/games/match/${m._id}/breakdown`} className="block px-4 py-3 border-b border-slate-50 dark:border-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{m.opponent}</span>
                  <span className="text-xs text-slate-500 ml-2">{m.mode}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('font-bold text-sm', m.won ? 'text-emerald-600' : 'text-rose-600')}>
                    {m.won ? 'W' : 'L'}
                  </span>
                  {m.ratingDelta !== undefined && (
                    <span className={cn('text-xs font-mono font-bold', m.ratingDelta > 0 ? 'text-emerald-600' : 'text-rose-600')}>
                      {m.ratingDelta > 0 ? '+' : ''}{m.ratingDelta}
                    </span>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4">
      <div className="text-slate-400 mb-1">{icon}</div>
      <div className="text-xs text-slate-500 font-medium">{label}</div>
      <div className="text-lg font-bold text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}
