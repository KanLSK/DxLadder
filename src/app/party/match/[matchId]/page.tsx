'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ClinicalChart } from '@/components/session/ClinicalChart';
import { ArrowRight, Sparkles, Trophy, Eye, EyeOff, Zap, Loader2, Crown, Check, X, Lock, Ban, Shuffle, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

type SabotageEffect = {
  type: string;
  expiresAt: number;
};

export default function PartyMatchPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const matchId = params.matchId as string;
  const playerKey = session?.user?.id;

  // Game state
  const [caseData, setCaseData] = useState<any>(null);
  const [matchState, setMatchState] = useState<any>(null);
  const [currentLayerIndex, setCurrentLayerIndex] = useState(0);
  const [guess, setGuess] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reveal, setReveal] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isError, setIsError] = useState(false);

  // Sabotage
  const [activeEffects, setActiveEffects] = useState<SabotageEffect[]>([]);
  const [sabotageCount, setSabotageCount] = useState(0);
  const [showSabotageMenu, setShowSabotageMenu] = useState(false);
  const [sabotageTarget, setSabotageTarget] = useState('');

  const prevHistoryLength = useRef(history.length);

  // Fetch case data once
  useEffect(() => {
    const fetchCase = async () => {
      try {
        const res = await fetch(`/api/party/matches/${matchId}/case`);
        const data = await res.json();
        if (data.ok) {
          setCaseData(data.caseData);
        }
      } catch (err) {
        console.error('Failed to fetch case:', err);
      }
    };
    fetchCase();
  }, [matchId]);

  // Poll match state every 1s
  const fetchMatchState = useCallback(async () => {
    try {
      const res = await fetch(`/api/party/matches/${matchId}/state`);
      const data = await res.json();
      if (data.ok) {
        setMatchState(data.match);

        // Check for sabotage events targeting this player
        if (playerKey && data.match.sabotageEvents) {
          const now = Date.now();
          const myEvents = data.match.sabotageEvents.filter(
            (e: any) => e.toPlayerKey === playerKey && new Date(e.firedAt).getTime() + (e.duration || 0) > now
          );
          setActiveEffects(myEvents.map((e: any) => ({
            type: e.type,
            expiresAt: new Date(e.firedAt).getTime() + (e.duration || 0),
          })));
        }

        // Count my used sabotages
        if (playerKey && data.match.sabotageEvents) {
          const myCount = data.match.sabotageEvents.filter((e: any) => e.fromPlayerKey === playerKey).length;
          setSabotageCount(myCount);
        }
      }
    } catch (err) {
      console.error('Failed to fetch match state:', err);
    }
  }, [matchId, playerKey]);

  useEffect(() => {
    fetchMatchState();
    const interval = setInterval(fetchMatchState, 1000);
    return () => clearInterval(interval);
  }, [fetchMatchState]);

  // Clean up expired effects
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveEffects(prev => prev.filter(e => e.expiresAt > Date.now()));
    }, 500);
    return () => clearInterval(timer);
  }, []);

  // Wrong guess feedback
  useEffect(() => {
    if (history.length > prevHistoryLength.current) {
      setIsError(true);
      const timer = setTimeout(() => setIsError(false), 2000);
      return () => clearTimeout(timer);
    }
    prevHistoryLength.current = history.length;
  }, [history]);

  const handleGuess = async () => {
    if (!guess.trim() || submitting || solved || failed) return;
    setSubmitting(true);
    setHistory(prev => [...prev, guess]);

    try {
      const res = await fetch(`/api/party/matches/${matchId}/guess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guess }),
      });
      const data = await res.json();

      if (data.correct) {
        setSolved(true);
        setReveal(data.reveal);
      } else if (data.finished) {
        setFailed(true);
        setReveal(data.reveal);
      } else {
        setCurrentLayerIndex(data.nextLayerIndex);
      }
      setGuess('');
    } catch (err) {
      console.error('Guess failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSabotage = async (type: string) => {
    if (!sabotageTarget || sabotageCount >= 2) return;
    try {
      await fetch(`/api/party/matches/${matchId}/sabotage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, targetPlayerKey: sabotageTarget }),
      });
      setShowSabotageMenu(false);
      setSabotageTarget('');
    } catch (err) {
      console.error('Sabotage failed:', err);
    }
  };

  const isFogged = activeEffects.some(e => e.type === 'FogOfWar');
  const isJammed = activeEffects.some(e => e.type === 'JammedSubmit');
  const finished = solved || failed;
  const matchEnded = matchState?.status === 'ended';
  const lastGuess = history.length > 0 ? history[history.length - 1] : null;
  const sabotageEnabled = matchState?.sabotageEvents !== undefined;

  // Get other players for sabotage targeting
  const otherPlayers = matchState?.scoreboard?.filter((p: any) => p.playerKey !== playerKey && !p.finished) || [];

  if (!caseData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <div className="text-sm font-bold uppercase tracking-widest text-slate-400 animate-pulse">Loading match…</div>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Main Play Area */}
        <div className={cn("flex-1 min-w-0 relative", isFogged && "select-none")}>
          {/* Fog overlay */}
          {isFogged && (
            <div className="absolute inset-0 z-20 bg-slate-900/60 backdrop-blur-lg rounded-2xl flex items-center justify-center animate-in fade-in duration-300">
              <div className="text-center">
                <EyeOff className="w-12 h-12 text-rose-400 mx-auto mb-3 animate-pulse" />
                <div className="text-lg font-bold text-white">Fog of War!</div>
                <div className="text-sm text-slate-300">Vision obscured for a few seconds…</div>
              </div>
            </div>
          )}

          <ClinicalChart
            caseData={caseData}
            currentLayerIndex={currentLayerIndex}
            solved={solved}
            failed={failed}
            reveal={reveal}
          />

          {/* Input Bar — fixed bottom */}
          {!finished && (
            <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#F9FAFB] via-[#F9FAFB]/90 to-transparent dark:from-[#09090B] dark:via-[#09090B]/90 pb-safe z-30 px-4 p-4 pt-20 pointer-events-none flex flex-col items-center">
              <div className="w-full max-w-2xl mx-auto pointer-events-auto">
                {/* Feedback bubble */}
                <div className="h-10 flex items-end justify-center mb-3">
                  {isError && lastGuess && (
                    <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-xl px-4 py-2 rounded-2xl flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in duration-300">
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Not <span className="text-rose-500 font-bold capitalize">{lastGuess}</span>. Next layer unlocked.
                      </span>
                    </div>
                  )}
                  {isJammed && (
                    <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 shadow-xl px-4 py-2 rounded-2xl flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in duration-300">
                      <Ban className="w-4 h-4 text-rose-500" />
                      <span className="text-sm font-bold text-rose-600 dark:text-rose-400">Submit jammed!</span>
                    </div>
                  )}
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleGuess(); }} className="relative group">
                  <input
                    type="text"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    autoFocus
                    disabled={isJammed}
                    placeholder={isJammed ? "Submit disabled…" : "Submit your diagnosis…"}
                    className={cn(
                      "w-full px-6 py-4 pr-16 rounded-2xl text-lg font-medium outline-none transition-all duration-300",
                      "bg-white dark:bg-[#18181B] text-slate-900 dark:text-slate-50",
                      "shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]",
                      isJammed
                        ? "border-rose-300 dark:border-rose-500/30 opacity-50 cursor-not-allowed"
                        : isError
                          ? "border-rose-300 dark:border-rose-500/30 ring-4 ring-rose-500/10"
                          : "border border-slate-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                    )}
                  />
                  <button
                    type="submit"
                    disabled={!guess.trim() || submitting || isJammed}
                    className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-zinc-800 disabled:text-slate-400 text-white rounded-xl transition-all duration-200 active:scale-95"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Scoreboard Sidebar */}
        <div className="w-full lg:w-72 shrink-0 space-y-4 lg:sticky lg:top-20">
          <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-amber-500" /> Live Scoreboard
              </h3>
              {matchEnded && <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">FINISHED</span>}
            </div>

            <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {matchState?.scoreboard
                ?.sort((a: any, b: any) => {
                  if (a.finished && !b.finished) return -1;
                  if (!a.finished && b.finished) return 1;
                  return a.score - b.score;
                })
                .map((p: any, idx: number) => {
                  const isMe = p.playerKey === playerKey;
                  return (
                    <div key={p.playerKey} className={cn(
                      "px-4 py-3 flex items-center gap-3 transition-colors",
                      isMe && "bg-indigo-50/50 dark:bg-indigo-500/5"
                    )}>
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0",
                        p.finished ? (p.solvedAt ? "bg-emerald-500" : "bg-rose-500") : "bg-slate-400"
                      )}>
                        {p.finished ? (p.solvedAt ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />) : idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1">
                          {p.name} {isMe && <span className="text-[8px] text-slate-400">(you)</span>}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>L{p.layersUsed}/7</span>
                          <span>•</span>
                          <span>{p.wrongGuesses}✗</span>
                          {p.finished && p.solvedAt && <span className="text-emerald-500 font-bold">Solved</span>}
                          {p.finished && !p.solvedAt && <span className="text-rose-500 font-bold">Failed</span>}
                          {!p.finished && <span className="text-amber-500 animate-pulse">thinking…</span>}
                        </div>
                      </div>
                      {p.finished && <div className="text-xs font-black text-slate-900 dark:text-white">{p.score}</div>}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Sabotage Cards */}
          {sabotageEnabled && !finished && sabotageCount < 2 && otherPlayers.length > 0 && (
            <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-rose-500 flex items-center gap-1.5">
                  <Zap className="w-3 h-3" /> Sabotage ({2 - sabotageCount} left)
                </h4>
              </div>

              {!showSabotageMenu ? (
                <button
                  onClick={() => setShowSabotageMenu(true)}
                  className="w-full py-2.5 rounded-lg text-xs font-bold border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                >
                  Use Sabotage Card
                </button>
              ) : (
                <div className="space-y-2 animate-in fade-in duration-200">
                  {/* Target selector */}
                  <select
                    value={sabotageTarget}
                    onChange={e => setSabotageTarget(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-2 py-2 text-xs font-semibold"
                  >
                    <option value="">Pick target…</option>
                    {otherPlayers.map((p: any) => (
                      <option key={p.playerKey} value={p.playerKey}>{p.name}</option>
                    ))}
                  </select>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button onClick={() => handleSabotage('FogOfWar')} disabled={!sabotageTarget} className="py-2 rounded-lg text-[10px] font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 disabled:opacity-30 flex items-center justify-center gap-1">
                      <EyeOff className="w-3 h-3" /> Fog
                    </button>
                    <button onClick={() => handleSabotage('JammedSubmit')} disabled={!sabotageTarget} className="py-2 rounded-lg text-[10px] font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 disabled:opacity-30 flex items-center justify-center gap-1">
                      <Ban className="w-3 h-3" /> Jam
                    </button>
                    <button onClick={() => handleSabotage('SwapFocus')} disabled={!sabotageTarget} className="py-2 rounded-lg text-[10px] font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 disabled:opacity-30 flex items-center justify-center gap-1">
                      <Shuffle className="w-3 h-3" /> Swap
                    </button>
                    <button onClick={() => handleSabotage('LockTax')} disabled={!sabotageTarget} className="py-2 rounded-lg text-[10px] font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 disabled:opacity-30 flex items-center justify-center gap-1">
                      <DollarSign className="w-3 h-3" /> Tax
                    </button>
                  </div>

                  <button onClick={() => { setShowSabotageMenu(false); setSabotageTarget(''); }} className="w-full text-[10px] text-slate-400 font-semibold py-1">
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Match ended — back to party */}
          {matchEnded && (
            <button
              onClick={() => router.push('/party')}
              className="w-full py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all active:scale-95"
            >
              Back to Party
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
