'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Swords, Trophy, Loader2, ChevronRight, History } from 'lucide-react';
import { LoadingOverlay } from '@/components/games/LoadingOverlay';
import { SmallStatsStrip } from '@/components/games/SmallStatsStrip';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const LOADING_TIPS = [
  "A raised JVP strongly suggests right-sided heart failure.",
  "Koplik spots are pathognomonic for measles.",
  "The triad of fever, neck stiffness, and altered mental status suggests meningitis.",
  "Pain radiating to the left shoulder (Kehr's sign) can indicate splenic rupture.",
  "An aura is experienced by about 20% of people with migraines.",
  "Charcot's neurologic triad: nystagmus, intention tremor, scanning speech (Multiple Sclerosis).",
  "Virchow's node (left supraclavicular) strongly suggests gastric cancer.",
  "The most common cause of community-acquired pneumonia is Streptococcus pneumoniae.",
  "A 'machine-like' murmur is characteristic of Patent Ductus Arteriosus (PDA).",
  "Hyperpigmentation of the palmar creases is a classic sign of Addison's disease."
];

export default function DuelLobbyPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [profile, setProfile] = useState<any>(null);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [queueing, setQueueing] = useState(false);
  const [inQueue, setInQueue] = useState(false);
  const [currentTip, setCurrentTip] = useState(LOADING_TIPS[0]);

  useEffect(() => {
    if (!queueing && !inQueue) return;
    const interval = setInterval(() => {
      setCurrentTip(LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)]);
    }, 4000);
    return () => clearInterval(interval);
  }, [queueing, inQueue]);

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
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [session]);

  const handleJoinQueue = async () => {
    setQueueing(true);
    setCurrentTip(LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)]);
    try {
      const res = await fetch('/api/games/ranked/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.ok) {
        if (data.status === 'matched') {
          router.push(`/app/games/match/${data.matchId}`);
        } else {
          setInQueue(true);
          pollMatchmaker();
        }
      }
    } catch {} finally {
      setQueueing(false);
    }
  };

  const pollMatchmaker = async () => {
    const interval = setInterval(async () => {
      try {
        await fetch('/api/games/ranked/matchmaker', { method: 'POST' });
        const res = await fetch('/api/games/ranked/queue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        if (data.ok && data.status === 'matched') {
          clearInterval(interval);
          setInQueue(false);
          router.push(`/app/games/match/${data.matchId}`);
        }
      } catch {}
    }, 3000);

    setTimeout(() => {
      clearInterval(interval);
      setInQueue(false);
    }, 300000);
  };

  const handleLeaveQueue = async () => {
    try {
      await fetch('/api/games/ranked/queue', { method: 'DELETE' });
    } catch {}
    setInQueue(false);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="mb-8">
        <Link href="/app/games" className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors mb-4">
          <ChevronRight className="w-4 h-4 rotate-180 mr-1" /> Back to Arenas
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-900 flex items-center justify-center shrink-0">
            <Trophy className="w-7 h-7 text-amber-500" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Dx Duel</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Ranked 1v1. No sabotage. Pure clinical skill.</p>
          </div>
        </div>
      </div>

      {loadingProfile ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
              <Trophy className="w-16 h-16 text-amber-500 mb-4 opacity-50" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Ready for Battle?</h2>
              <p className="text-slate-500 mb-8 max-w-sm">
                Fight your way up the ladder. Difficulty scales automatically with your ELO rating.
              </p>
              
              <button
                onClick={handleJoinQueue}
                disabled={queueing}
                className="w-full max-w-xs py-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-zinc-900 font-black text-base shadow-lg shadow-slate-900/10 dark:shadow-white/10 hover:scale-105 transition-all outline-none focus:ring-4 focus:ring-slate-900/20 disabled:scale-100 disabled:opacity-50"
              >
                Find Match <Swords className="w-5 h-5 inline-block ml-2 -mt-0.5" />
              </button>
            </div>

            {profile && <SmallStatsStrip profile={profile} />}
          </div>

          {/* Side Column: History */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 overflow-hidden flex flex-col h-[400px]">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-500" /> Recent Battles
            </h3>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
              {recentMatches.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <span className="text-sm font-medium">No matches yet</span>
                </div>
              ) : (
                recentMatches.map((m: any) => (
                  <Link
                    key={m._id}
                    href={`/app/games/match/${m._id}/breakdown`}
                    className="block p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-100 dark:border-zinc-800 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate pr-2">
                        vs. {m.opponent}
                      </span>
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0",
                        m.won ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400"
                      )}>
                        {m.won ? "Win" : "Loss"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>Diff {m.difficulty || '?'}</span>
                      {m.ratingDelta !== undefined && (
                        <span className={cn(
                          "font-mono font-bold",
                          m.ratingDelta > 0 ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {m.ratingDelta > 0 ? '+' : ''}{m.ratingDelta} ELO
                        </span>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
            
            <Link href="/app/games/history" className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800 text-xs font-bold text-indigo-500 text-center hover:text-indigo-600 transition-colors block">
              View full history &rarr;
            </Link>
          </div>
        </div>
      )}

      <LoadingOverlay
        isOpen={queueing || inQueue}
        title="Searching for opponent..."
        subtitle={currentTip}
        onCancel={handleLeaveQueue}
        icon={<Swords className="w-12 h-12 text-amber-500 mb-6 animate-pulse" />}
      />
    </div>
  );
}
