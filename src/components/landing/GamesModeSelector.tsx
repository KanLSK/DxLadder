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
    mechanic: 'First to diagnose wins.',
    tagline: 'Anonymous ranked ladder.',
    players: '1v1',
    type: 'Ranked',
    icon: <Swords className="w-8 h-8 text-indigo-500" />,
    bg: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]',
    link: '/app/games/duel'
  },
  {
    id: 'arena',
    name: 'Private Arena',
    mechanic: 'Invite your study group.',
    tagline: 'Defend your diagnosis.',
    players: '1v1, 2v2, 4v4',
    type: 'Unranked',
    icon: <Lock className="w-8 h-8 text-emerald-500" />,
    bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]',
    link: '/app/games/friends'
  },
  {
    id: 'auction',
    name: 'Clue Auction',
    mechanic: 'Spend points to reveal data.',
    tagline: 'Bluff or outthink your opponent.',
    players: '2v2, 4v4',
    type: 'Unranked',
    icon: <Shield className="w-8 h-8 text-amber-500" />,
    bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]',
    link: '/app/games/auction'
  },
  {
    id: 'chaos',
    name: 'Chaos Mode',
    mechanic: 'Inject fake labs.',
    tagline: 'Force mechanism checks on rivals.',
    players: '4v4',
    type: 'Unranked',
    icon: <Zap className="w-8 h-8 text-rose-500" />,
    bg: 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 hover:shadow-[0_0_30px_rgba(244,63,94,0.2)]',
    link: '/app/games/chaos'
  }
];

export function GamesModeSelector() {
  const [selectedSize, setSelectedSize] = useState<TeamSize | 'all'>('all');

  return (
    <section id="games" className="py-24 bg-slate-50 dark:bg-[#09090B] border-y border-slate-100 dark:border-zinc-800/80 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4 uppercase">
            Choose your battlefield.
          </h2>
        </div>

        {/* Interactive Selector */}
        <div className="flex flex-col items-center mb-12">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-1.5 rounded-2xl flex items-center shadow-sm">
                <button 
                  onClick={() => setSelectedSize('all')}
                  className={cn("px-6 py-3 rounded-xl text-sm font-extrabold transition-all", selectedSize === 'all' ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
                >
                  All Modes
                </button>
                <button 
                  onClick={() => setSelectedSize('1v1')}
                  className={cn("px-6 py-3 rounded-xl text-sm font-extrabold transition-all", selectedSize === '1v1' ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
                >
                  1v1
                </button>
                <button 
                  onClick={() => setSelectedSize('2v2')}
                  className={cn("px-6 py-3 rounded-xl text-sm font-extrabold transition-all", selectedSize === '2v2' ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
                >
                  2v2
                </button>
                <button 
                  onClick={() => setSelectedSize('4v4')}
                  className={cn("px-6 py-3 rounded-xl text-sm font-extrabold transition-all", selectedSize === '4v4' ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
                >
                  4v4
                </button>
            </div>
        </div>

        {/* Game Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8">
            {MODES.map((mode) => {
                const isSupported = selectedSize === 'all' || mode.players.includes(selectedSize);
                
                return (
                    <Link
                      key={mode.id}
                      href={mode.link}
                      className={cn(
                        "group p-8 rounded-[2rem] border transition-all duration-500 flex flex-col items-start gap-6 cursor-pointer hover:-translate-y-2 relative overflow-hidden",
                        mode.bg,
                        isSupported ? "opacity-100 scale-100" : "opacity-40 scale-[0.98] grayscale-[0.8] pointer-events-none"
                      )}
                    >
                        {/* Interactive overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                        <div className="w-20 h-20 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-center shrink-0 border border-slate-100 dark:border-zinc-800 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 relative z-10">
                            {mode.icon}
                        </div>
                        <div className="flex-1 w-full relative z-10">
                            <div className="flex items-center justify-between gap-3 mb-2">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{mode.name}</h3>
                                {mode.type === 'Ranked' && (
                                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-indigo-600 text-white shadow-sm">
                                      <Globe className="w-3 h-3" />
                                      {mode.type}
                                  </div>
                                )}
                            </div>
                            <p className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-1">{mode.mechanic}</p>
                            <p className="text-slate-600 dark:text-slate-400 font-medium mb-6">{mode.tagline}</p>
                            <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-6 mt-auto">
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                    <Users className="w-4 h-4" /> {mode.players}
                                </span>
                                <span className="flex items-center gap-1 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300 text-slate-900 dark:text-white">
                                    Play <ArrowRight className="w-4 h-4 ml-1" />
                                </span>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
      </div>
    </section>
  );
}
