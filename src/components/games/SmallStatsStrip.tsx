import React from 'react';
import { Trophy, TrendingUp, TrendingDown, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmallStatsStripProps {
  profile: any;
  recentMatch?: any;
}

export function SmallStatsStrip({ profile, recentMatch }: SmallStatsStripProps) {
  if (!profile) return null;

  const winRate = profile.matchesPlayed > 0 
    ? Math.round((profile.wins / profile.matchesPlayed) * 100) 
    : 0;

  return (
    <div className="flex flex-wrap items-center gap-4 py-3 px-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm text-sm">
      <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
        <Trophy className="w-4 h-4 text-amber-500" />
        {profile.tier} <span className="font-mono font-bold text-slate-900 dark:text-white ml-1">{profile.rating}</span>
      </div>
      
      <div className="w-px h-4 bg-slate-200 dark:bg-zinc-700 hidden sm:block" />
      
      <div className="flex items-center gap-2 text-slate-500 font-medium">
        <Swords className="w-4 h-4" />
        {profile.wins}W - {profile.losses}L <span className="text-slate-400 text-xs ml-1">({winRate}%)</span>
      </div>

      {recentMatch && (
        <>
          <div className="w-px h-4 bg-slate-200 dark:bg-zinc-700 hidden sm:block" />
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <span className="text-xs text-slate-400">Last match:</span>
            <span className={cn(
              "font-bold",
              recentMatch.won ? "text-emerald-600" : "text-rose-600"
            )}>
              {recentMatch.won ? 'W' : 'L'}
            </span>
            {recentMatch.ratingDelta !== undefined && (
              <span className={cn(
                "font-mono flex items-center text-xs",
                recentMatch.ratingDelta > 0 ? "text-emerald-600" : "text-rose-600"
              )}>
                {recentMatch.ratingDelta > 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                {Math.abs(recentMatch.ratingDelta)}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
