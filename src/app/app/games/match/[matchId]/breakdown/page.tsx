'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Swords, Trophy, Clock, Layers, XCircle, TrendingUp, TrendingDown, Loader2, Check, X, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BreakdownPage() {
  const params = useParams();
  const { data: session } = useSession();
  const matchId = params.matchId as string;
  const userId = session?.user?.id;

  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await fetch(`/api/games/matches/${matchId}/state`);
        const data = await res.json();
        if (data.ok) setMatch(data.match);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, [matchId]);

  if (loading || !match) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  const me = match.scoreboard?.find((p: any) => p.userId === userId);
  const opponent = match.scoreboard?.find((p: any) => p.userId !== userId);
  const myRC = match.ratingChanges?.find((rc: any) => rc.userId === userId);
  const myScoringLines = match.breakdown?.scoringLines?.[userId!] || [];
  const oppScoringLines = opponent ? (match.breakdown?.scoringLines?.[opponent.userId] || []) : [];

  // Determine winner
  const iWon = me?.solvedAt
    ? (!opponent?.solvedAt || new Date(me.solvedAt) <= new Date(opponent.solvedAt))
    : me?.score > (opponent?.score || 0);

  const formatTime = (start: string, end: string) => {
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center mb-8">
        <div className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm mb-3',
          iWon ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700'
        )}>
          {iWon ? <Trophy className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {iWon ? 'Victory' : 'Defeat'}
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Match Breakdown</h1>
        <div className="flex items-center justify-center gap-3 mt-2 text-sm text-slate-500">
          <span className={cn(
            'px-2 py-0.5 rounded-full text-xs font-bold',
            match.type === 'ranked' ? 'bg-amber-50 text-amber-700' : 'bg-indigo-50 text-indigo-700'
          )}>
            {match.type}
          </span>
          <span>{match.mode}</span>
          <span>Difficulty {match.assignedParams?.difficulty}</span>
          <span>{match.assignedParams?.style}</span>
        </div>
      </div>

      {/* Rating change */}
      {myRC && (
        <div className={cn(
          'rounded-xl p-4 flex items-center justify-between mb-6',
          myRC.delta > 0
            ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800'
            : 'bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-800'
        )}>
          <div className="flex items-center gap-2">
            {myRC.delta > 0 ? <TrendingUp className="w-5 h-5 text-emerald-600" /> : <TrendingDown className="w-5 h-5 text-rose-600" />}
            <span className="font-bold text-slate-900 dark:text-white">ELO Change</span>
          </div>
          <div className="text-right">
            <span className={cn('text-xl font-bold', myRC.delta > 0 ? 'text-emerald-600' : 'text-rose-600')}>
              {myRC.delta > 0 ? '+' : ''}{myRC.delta}
            </span>
            <div className="text-xs text-slate-500">{myRC.oldRating} → {myRC.newRating}</div>
          </div>
        </div>
      )}

      {/* Player comparison */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Me */}
        <PlayerCard
          player={me}
          label="You"
          isWinner={iWon}
          startedAt={match.startedAt}
          scoringLines={myScoringLines}
        />
        {/* Opponent */}
        {opponent && (
          <PlayerCard
            player={opponent}
            label={opponent.name}
            isWinner={!iWon}
            startedAt={match.startedAt}
            scoringLines={oppScoringLines}
          />
        )}
      </div>

      {/* Key events timeline */}
      {match.breakdown?.keyEvents?.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> Timeline
          </h3>
          <div className="space-y-3">
            {match.breakdown.keyEvents.map((event: any, idx: number) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm text-slate-900 dark:text-white">{event.desc}</p>
                  {event.ts && match.startedAt && (
                    <p className="text-[10px] text-slate-400 font-mono">{formatTime(match.startedAt, event.ts)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PlayerCard({ player, label, isWinner, startedAt, scoringLines }: any) {
  const solveTime = player?.solvedAt && startedAt
    ? Math.round((new Date(player.solvedAt).getTime() - new Date(startedAt).getTime()) / 1000)
    : null;

  return (
    <div className={cn(
      'bg-white dark:bg-zinc-900 border rounded-2xl p-5',
      isWinner ? 'border-emerald-200 dark:border-emerald-800' : 'border-slate-200 dark:border-zinc-800'
    )}>
      <div className="flex items-center gap-2 mb-4">
        {isWinner && <Trophy className="w-4 h-4 text-amber-500" />}
        <span className="font-bold text-sm text-slate-900 dark:text-white">{label}</span>
        <span className={cn(
          'text-[10px] font-bold px-1.5 py-0.5 rounded ml-auto',
          player?.solvedAt ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
        )}>
          {player?.solvedAt ? 'Solved' : 'Failed'}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center">
          <div className="text-[10px] text-slate-500 font-medium">Score</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">{player?.score || 0}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-slate-500 font-medium flex items-center justify-center gap-1"><Layers className="w-3 h-3" /> Layers</div>
          <div className="text-lg font-bold">{player?.layersUsed || 0}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-slate-500 font-medium flex items-center justify-center gap-1"><XCircle className="w-3 h-3" /> Wrong</div>
          <div className="text-lg font-bold">{player?.wrongGuesses || 0}</div>
        </div>
      </div>

      {solveTime !== null && (
        <div className="text-center text-xs text-slate-500 mb-3 flex items-center justify-center gap-1">
          <Clock className="w-3 h-3" />
          {Math.floor(solveTime / 60)}m {solveTime % 60}s
        </div>
      )}

      {/* Scoring breakdown */}
      {scoringLines.length > 0 && (
        <div className="border-t border-slate-100 dark:border-zinc-800 pt-3 space-y-1.5">
          {scoringLines.map((line: any, idx: number) => (
            <div key={idx} className={cn(
              'flex items-center justify-between text-xs',
              line.label === 'Final' ? 'font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-zinc-700 pt-1.5 mt-1.5' : 'text-slate-600 dark:text-slate-400'
            )}>
              <span>{line.label}</span>
              <span className={cn(
                'font-mono',
                line.value > 0 ? 'text-emerald-600' : line.value < 0 ? 'text-rose-600' : ''
              )}>
                {line.value > 0 ? '+' : ''}{line.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
