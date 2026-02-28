import React from 'react';
import { Trophy, Clock, Layers, XCircle, Share, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MatchRecapCardProps {
  mode: string;
  result: 'Victory' | 'Defeat' | 'Draw';
  solveTimeFormatted?: string;
  layersUsed: number;
  wrongGuesses: number;
  score: number;
  ratingDelta?: number;
  onShare?: () => void;
}

export function MatchRecapCard({
  mode,
  result,
  solveTimeFormatted,
  layersUsed,
  wrongGuesses,
  score,
  ratingDelta,
  onShare,
}: MatchRecapCardProps) {
  const isWin = result === 'Victory';
  
  return (
    <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header Banner */}
      <div className={cn(
        "p-6 text-center border-b",
        isWin 
          ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-800" 
          : "bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-800"
      )}>
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-zinc-800 shadow-sm mb-3">
          {isWin ? <Trophy className="w-6 h-6 text-emerald-500" /> : <XCircle className="w-6 h-6 text-rose-500" />}
        </div>
        <h2 className={cn(
          "text-2xl font-black uppercase tracking-widest",
          isWin ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
        )}>
          {result}
        </h2>
        <p className="text-sm font-bold opacity-70 mt-1">{mode}</p>
      </div>

      {/* Stats Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-2xl p-4 text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
              <Star className="w-3 h-3" /> Score
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {score}
            </div>
          </div>
          
          {ratingDelta !== undefined && (
            <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-2xl p-4 text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                <Trophy className="w-3 h-3" /> ELO
              </div>
              <div className={cn(
                "text-2xl font-black",
                ratingDelta > 0 ? "text-emerald-600" : "text-rose-600"
              )}>
                {ratingDelta > 0 ? '+' : ''}{ratingDelta}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-around py-4 border-t border-b border-slate-100 dark:border-zinc-800/50 mb-6">
          {solveTimeFormatted && (
            <div className="text-center">
              <div className="text-slate-400 mb-1 flex justify-center"><Clock className="w-4 h-4" /></div>
              <div className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">{solveTimeFormatted}</div>
            </div>
          )}
          <div className="text-center">
            <div className="text-slate-400 mb-1 flex justify-center"><Layers className="w-4 h-4" /></div>
            <div className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">{layersUsed}</div>
          </div>
          <div className="text-center">
            <div className="text-slate-400 mb-1 flex justify-center"><XCircle className="w-4 h-4" /></div>
            <div className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">{wrongGuesses}</div>
          </div>
        </div>

        {/* Action */}
        <button
          onClick={onShare}
          className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold transition-colors hover:bg-slate-800 dark:hover:bg-slate-200 shadow-sm flex items-center justify-center gap-2"
        >
          <Share className="w-4 h-4" /> Share Result
        </button>
      </div>
    </div>
  );
}
