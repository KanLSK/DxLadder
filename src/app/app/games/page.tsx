'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Swords, Trophy, Users, Zap, Gavel, HelpCircle } from 'lucide-react';
import { GameModeCard } from '@/components/games/GameModeCard';
import { HowItWorksModal } from '@/components/games/HowItWorksModal';
import { SmallStatsStrip } from '@/components/games/SmallStatsStrip';

export default function GamesHubPage() {
  const { data: session } = useSession();
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [recentMatch, setRecentMatch] = useState<any>(null);

  // Fetch basic stats
  useEffect(() => {
    if (!session?.user?.id) return;
    fetch('/api/games/profile')
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          setProfile(data.profile);
          if (data.recentMatches?.length > 0) {
            setRecentMatch(data.recentMatches[0]);
          }
        }
      })
      .catch(() => {});
  }, [session]);

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <Swords className="w-8 h-8 text-indigo-500" />
            Games
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5 font-medium text-lg">
            Choose your arena. Same brain, different chaos.
          </p>
        </div>
        <button
          onClick={() => setShowHowItWorks(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-zinc-800/50 hover:bg-slate-200 dark:hover:bg-zinc-800 text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors"
        >
          <HelpCircle className="w-4 h-4" /> How it works
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <GameModeCard
          title="Dx Duel"
          tagline="High-IQ 1v1. No sabotage."
          icon={<Trophy className="w-6 h-6" />}
          pills={['1v1', 'Ranked', 'ELO']}
          ctaText="Enter Ranked Ladder"
          href="/app/games/duel"
          gradientClass="bg-amber-400"
        />

        <GameModeCard
          title="Private Arena"
          tagline="Create a room. Control the chaos."
          icon={<Users className="w-6 h-6" />}
          pills={['1v1 / 2v2 / 4v4', 'Custom Difficulty', 'Optional Sabotage']}
          ctaText="Create / Join Room"
          href="/app/games/friends"
          gradientClass="bg-indigo-400"
        />

        <GameModeCard
          title="Clue Auction"
          tagline="Bid for clues. Bluff to win."
          icon={<Gavel className="w-6 h-6" />}
          pills={['3–8 Players', 'Secret Bids', 'Credits']}
          ctaText="Start Auction"
          href="/app/games/auction"
          gradientClass="bg-emerald-400"
        />

        <GameModeCard
          title="Chaos Mode"
          tagline="Sabotage, red herrings, and mind games."
          icon={<Zap className="w-6 h-6" />}
          pills={['Friends', 'Sabotage', 'Unranked']}
          ctaText="Enter Chaos"
          href="/app/games/chaos"
          gradientClass="bg-rose-400"
        />
      </div>

      {/* Stats Strip */}
      {profile && (
        <div className="max-w-2xl mx-auto">
          <SmallStatsStrip profile={profile} recentMatch={recentMatch} />
        </div>
      )}

      {/* Modals */}
      <HowItWorksModal
        isOpen={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
      />
    </div>
  );
}
