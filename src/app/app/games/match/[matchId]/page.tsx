'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { usePusher } from '@/hooks/usePusher';
import { channels, events } from '@/lib/pusher';
import { ClinicalChart } from '@/components/session/ClinicalChart';
import { ThinkSpace } from '@/components/session/ThinkSpace';
import { Swords, Loader2, Check, X, Trophy, TrendingUp, TrendingDown, Clock, ChevronRight } from 'lucide-react';
import { GameShell } from '@/components/games/GameShell';
import { cn } from '@/lib/utils';

interface ScoreboardEntry {
  userId: string;
  name: string;
  teamId?: string;
  score: number;
  layersUsed: number;
  wrongGuesses: number;
  finished: boolean;
  solvedAt?: string;
  connected: boolean;
}

export default function GameMatchPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const matchId = params.matchId as string;
  const userId = session?.user?.id;

  const [matchState, setMatchState] = useState<any>(null);
  const [caseData, setCaseData] = useState<any>(null);
  const [scoreboard, setScoreboard] = useState<ScoreboardEntry[]>([]);
  const [status, setStatus] = useState<'loading' | 'countdown' | 'playing' | 'solved' | 'failed' | 'ended'>('loading');
  const [reveal, setReveal] = useState<any>(null);
  const [ratingChange, setRatingChange] = useState<any>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(5);
  const [elapsedSec, setElapsedSec] = useState(0);
  const timerRef = useRef<any>(null);

  // Fetch match state
  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`/api/games/matches/${matchId}/state`);
      const data = await res.json();
      if (data.ok) {
        setMatchState(data.match);
        setScoreboard(data.match.scoreboard);

        if (data.match.status === 'countdown') {
          setStatus('countdown');
        } else if (data.match.status === 'active') {
          const myPlayer = data.match.scoreboard.find((p: any) => p.userId === userId);
          if (myPlayer?.finished) {
            setStatus(myPlayer.solvedAt ? 'solved' : 'failed');
          } else {
            setStatus('playing');
          }
        } else if (data.match.status === 'ended') {
          setStatus('ended');
        }

        // Fetch case data if active
        if (data.match.matchCaseId && !caseData) {
          // Point to the correct new Games system endpoint, not the old Party one
          const caseRes = await fetch(`/api/games/matches/${matchId}/case`);
          const caseJson = await caseRes.json();
          if (caseJson.ok) {
            setCaseData(caseJson.caseData);
          }
        }
      }
    } catch {}
  }, [matchId, userId, caseData]);

  useEffect(() => { fetchState(); }, [fetchState]);

  // Countdown timer
  useEffect(() => {
    if (status !== 'countdown') return;
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setStatus('playing');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  // Elapsed time tracker
  useEffect(() => {
    if (status === 'playing') {
      timerRef.current = setInterval(() => setElapsedSec(prev => prev + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);

  // Pusher events
  usePusher({
    channelName: channels.match(matchId),
    enabled: !!matchId,
    events: {
      [events.MATCH_STARTED]: () => {
        setStatus('playing');
        setCountdown(0);
      },
      [events.PLAYER_PROGRESS]: (data: any) => {
        setScoreboard(prev => prev.map(p =>
          p.userId === data.userId ? { ...p, ...data } : p
        ));
      },
      [events.PLAYER_SOLVED]: (data: any) => {
        setScoreboard(prev => prev.map(p =>
          p.userId === data.userId ? { ...p, finished: true, solvedAt: new Date().toISOString(), score: data.score } : p
        ));
      },
      [events.MATCH_ENDED]: (data: any) => {
        setStatus('ended');
        setScoreboard(data.scoreboard);
        if (data.ratingChanges) {
          const myChange = data.ratingChanges.find((rc: any) => rc.userId === userId);
          if (myChange) setRatingChange(myChange);
        }
        if (timerRef.current) clearInterval(timerRef.current);
      },
    },
  });

  const handleGuess = async (guess: string) => {
    const sessionToken = localStorage.getItem(`session_${matchState?.roomId || matchId}`);

    try {
      const res = await fetch(`/api/games/matches/${matchId}/guess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guess, sessionToken }),
      });
      const data = await res.json();

      if (data.ok) {
        setHistory(prev => [...prev, guess]);
        
        if (data.correct) {
          setStatus('solved');
          setReveal(data.reveal);
          if (data.ratingChange) setRatingChange(data.ratingChange);
        } else if (data.finished) {
          setStatus('failed');
          if (data.reveal) setReveal(data.reveal);
        }

        if (data.matchEnded) {
          setStatus('ended');
          if (timerRef.current) clearInterval(timerRef.current);
        }
        
        return { ok: true, isWrongGuess: !data.correct };
      } else {
        // e.g. Rate limit "Too fast!"
        return { ok: false, error: data.error || 'Server error, please try again' };
      }
    } catch (e) {
      console.error(e);
      return { ok: false, error: 'Network error, please check connection' };
    }
  };

  const myPlayer = scoreboard.find(p => p.userId === userId);
  const currentLayerIndex = myPlayer ? myPlayer.layersUsed - 1 : 0;
  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  // Loading
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading match…</p>
        </div>
      </div>
    );
  }

  // Countdown
  if (status === 'countdown') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-in zoom-in duration-300">
          <Swords className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
          <div className="text-7xl font-black text-indigo-600 mb-3 animate-pulse">{countdown}</div>
          <p className="text-slate-500 font-medium">Match starting…</p>
        </div>
      </div>
    );
  }

  const gameSubtitle = (
    <div className="flex items-center gap-4 justify-center">
      <div className="flex items-center gap-2 hidden md:flex">
        <span className={cn(
          'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
          matchState?.type === 'ranked'
            ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400'
        )}>
          {matchState?.type === 'ranked' ? 'Ranked' : 'Friend'}
        </span>
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 capitalize">
          {matchState?.mode || 'duel'}
        </span>
        {matchState?.assignedParams?.difficulty && (
          <span className="text-xs font-medium text-slate-500">
            • Diff {matchState.assignedParams.difficulty}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded-lg">
        <Clock className="w-4 h-4 text-slate-400" />
        <span className="font-mono text-sm font-bold">{formatTime(elapsedSec)}</span>
      </div>
    </div>
  );

  const scoreboardRail = (
    <>
      <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 sticky top-0 z-10 w-full">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Swords className="w-3.5 h-3.5" /> Live Scoreboard
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar w-full">
        {scoreboard.map((p, idx) => (
          <div key={p.userId} className={cn(
            'px-4 py-3 flex items-center gap-3 border-b border-slate-50 dark:border-zinc-800/50',
            p.userId === userId && 'bg-indigo-50/50 dark:bg-indigo-500/5'
          )}>
            <div className="text-lg font-black text-slate-300 dark:text-zinc-700 w-6 text-center">{idx + 1}</div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                {p.name}
                {p.userId === userId && <span className="text-[9px] bg-indigo-500 text-white px-1 rounded">YOU</span>}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                <span>L{p.layersUsed}</span>
                <span>×{p.wrongGuesses}</span>
                {p.finished && p.solvedAt && <Check className="w-3 h-3 text-emerald-500" />}
                {p.finished && !p.solvedAt && <X className="w-3 h-3 text-rose-500" />}
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono font-bold text-sm text-slate-900 dark:text-white">{p.score}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <GameShell
      icon={<Trophy className="w-5 h-5" />}
      title={matchState?.type === 'ranked' ? 'Dx Duel' : 'Private Arena'}
      subtitle={gameSubtitle}
      rightRail={scoreboardRail}
      bottomAction={
        status === 'playing' ? (
          <ThinkSpace
            onSubmit={handleGuess}
            disabled={false}
            history={history}
            status="playing"
          />
        ) : undefined
      }
    >
      {/* Case Panel Content */}
      <div className="flex flex-col h-full">
        {caseData && (status === 'playing' || status === 'solved' || status === 'failed' || status === 'ended') ? (
          <ClinicalChart
            caseData={caseData}
            currentLayerIndex={currentLayerIndex}
            solved={status === 'solved'}
            failed={status === 'failed' || status === 'ended'}
          />
        ) : (status === 'playing' && !caseData) ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
            <p className="text-sm font-bold text-slate-500">Loading case data...</p>
          </div>
        ) : null}

        {/* Result Breakdown */}
        {(status === 'solved' || status === 'failed' || status === 'ended') && reveal && (
          <div className="mt-8 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/50 rounded-2xl p-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-white',
                status === 'solved' ? 'bg-emerald-500' : 'bg-rose-500'
              )}>
                {status === 'solved' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
              </div>
              <h3 className={cn(
                'text-lg font-bold',
                status === 'solved' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              )}>
                {status === 'solved' ? 'Correct!' : 'The answer was:'}
              </h3>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white capitalize mb-4">{reveal.diagnosis}</p>
            {reveal.rationale && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{reveal.rationale}</p>
            )}

            {/* Rating change */}
            {ratingChange && (
              <div className={cn(
                'flex items-center gap-2 p-3 rounded-xl mb-4',
                ratingChange.delta > 0
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700'
                  : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700'
              )}>
                {ratingChange.delta > 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                <span className="font-bold">{ratingChange.delta > 0 ? '+' : ''}{ratingChange.delta}</span>
                <span className="text-sm">ELO ({ratingChange.oldRating} → {ratingChange.newRating})</span>
              </div>
            )}

            <button
              onClick={() => router.push(`/app/games/match/${matchId}/breakdown`)}
              className="w-full py-3 bg-white dark:bg-zinc-700 border border-slate-200 dark:border-zinc-600 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-zinc-600 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              View Detailed Breakdown <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </GameShell>
  );
}
