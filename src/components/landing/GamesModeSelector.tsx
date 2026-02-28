'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Swords, Users, Shield, Zap, Lock, Globe, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type TeamSize = '1v1' | '2v2' | '4v4';

const MODES = [
  {
    id: 'duel',
    name: 'Dx Duel',
    tagline: 'Ranked 1v1 clinical reasoning.',
    players: '1v1',
    type: 'Ranked',
    icon: <Swords className="w-6 h-6 text-indigo-500" />,
    bg: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20',
    link: '/app/games/duel'
  },
  {
    id: 'arena',
    name: 'Private Arena',
    tagline: 'Invite friends to a secure lobby.',
    players: '1v1, 2v2, 4v4',
    type: 'Unranked',
    icon: <Lock className="w-6 h-6 text-emerald-500" />,
    bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
    link: '/app/games/friends'
  },
  {
    id: 'auction',
    name: 'Clue Auction',
    tagline: 'Bid points to reveal data first.',
    players: '2v2, 4v4',
    type: 'Unranked',
    icon: <Shield className="w-6 h-6 text-amber-500" />,
    bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
    link: '/app/games/auction'
  },
  {
    id: 'chaos',
    name: 'Chaos Mode',
    tagline: 'Sabotage opponents with fake labs.',
    players: '4v4',
    type: 'Unranked',
    icon: <Zap className="w-6 h-6 text-rose-500" />,
    bg: 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20',
    link: '/app/games/chaos'
  }
];

export function GamesModeSelector() {
  const [selectedSize, setSelectedSize] = useState<TeamSize | 'all'>('all');

  return (
    <section id="games" className="py-24 bg-slate-50 dark:bg-[#09090B] border-y border-slate-100 dark:border-zinc-800/80 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Games that make studying viral.
          </h2>
          <p className="text-xl font-medium text-slate-500 dark:text-slate-400">
            Stop studying alone. Challenge the world or invite your study group to a private lobby.
          </p>
        </div>

        {/* Interactive Selector */}
        <div className="flex flex-col items-center mb-12">
            <span className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" /> Filter by Team Size
            </span>
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-1.5 rounded-2xl flex items-center shadow-sm">
                <button 
                  onClick={() => setSelectedSize('all')}
                  className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all", selectedSize === 'all' ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
                >
                  All Modes
                </button>
                <button 
                  onClick={() => setSelectedSize('1v1')}
                  className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all", selectedSize === '1v1' ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
                >
                  1v1
                </button>
                <button 
                  onClick={() => setSelectedSize('2v2')}
                  className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all", selectedSize === '2v2' ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
                >
                  2v2
                </button>
                <button 
                  onClick={() => setSelectedSize('4v4')}
                  className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all", selectedSize === '4v4' ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
                >
                  4v4
                </button>
            </div>
        </div>

        {/* Game Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6">
            {MODES.map((mode) => {
                const isSupported = selectedSize === 'all' || mode.players.includes(selectedSize);
                
                return (
                    <div 
                      key={mode.id}
                      className={cn(
                        "group p-6 rounded-3xl border transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center gap-6",
                        mode.bg,
                        isSupported ? "opacity-100 scale-100" : "opacity-40 scale-[0.98] grayscale-[0.8]"
                      )}
                    >
                        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-center shrink-0 border border-slate-100 dark:border-zinc-800 group-hover:scale-110 transition-transform">
                            {mode.icon}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{mode.name}</h3>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/50 dark:bg-black/20 text-slate-600 dark:text-slate-300 border border-black/5 dark:border-white/5">
                                    {mode.type === 'Ranked' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                    {mode.type}
                                </div>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 font-medium mb-3">{mode.tagline}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5" /> Supports: {mode.players}
                                </span>
                                <Link href={mode.link} className={cn("hidden sm:flex items-center gap-1 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity", mode.type === 'Ranked' ? "text-indigo-600" : "text-slate-900 dark:text-white")}>
                                    Play <ArrowRight className="w-4 h-4 line-through" />
                                </Link>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </section>
  );
}
