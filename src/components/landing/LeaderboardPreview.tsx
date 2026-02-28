'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy, ArrowUpRight, TrendingUp, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

const LEADERBOARD_DATA = [
  { rank: 1, name: 'Doc_1337', score: 14500, main: 'Cardiology', trend: 'up' },
  { rank: 2, name: 'House_MD', score: 14250, main: 'Internal Med', trend: 'same' },
  { rank: 3, name: 'Dx_Demon', score: 13900, main: 'Neurology', trend: 'up' },
  { rank: 4, name: 'PEDS_GOD', score: 13850, main: 'Pediatrics', trend: 'down' },
  { rank: 5, name: 'Unknown_Host', score: 13600, main: 'Infectious Dis', trend: 'up' },
];

export function LeaderboardPreview() {
  return (
    <section className="py-24 bg-indigo-900 border-y border-indigo-950 px-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10">
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-amber-400/20 text-amber-400 mb-6 shadow-[0_0_30px_rgba(251,191,36,0.2)]">
                    <Trophy className="w-8 h-8" />
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 uppercase">
                    The Global Ladder
                </h2>
                <p className="text-xl font-medium text-indigo-200">
                    Anonymous ranks. Brutal competition. Who's the sharpest mind this week?
                </p>
            </div>

            <div className="bg-indigo-950/50 backdrop-blur-md rounded-[2rem] border border-indigo-400/20 shadow-2xl overflow-hidden">
                <div className="divide-y divide-indigo-400/10">
                    {LEADERBOARD_DATA.map((player) => (
                        <div 
                          key={player.rank} 
                          className="flex items-center justify-between p-4 md:p-6 hover:bg-white/5 transition-colors group"
                        >
                            <div className="flex items-center gap-4 md:gap-6">
                                <div className={cn(
                                    "w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl font-black text-lg md:text-xl",
                                    player.rank === 1 ? "bg-amber-400 text-amber-950 shadow-[0_0_20px_rgba(251,191,36,0.4)]" :
                                    player.rank === 2 ? "bg-slate-300 text-slate-800" :
                                    player.rank === 3 ? "bg-amber-700 text-white" :
                                    "bg-indigo-900/50 text-indigo-300"
                                )}>
                                    #{player.rank}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg md:text-2xl font-black text-white tracking-tight group-hover:text-indigo-300 transition-colors">
                                            {player.name}
                                        </h3>
                                        {player.rank === 1 && <Medal className="w-5 h-5 text-amber-400 drop-shadow-md" />}
                                    </div>
                                    <p className="text-sm font-medium text-indigo-300/80 uppercase tracking-wider">
                                        Main: {player.main}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-lg md:text-2xl font-black text-white">
                                        {player.score.toLocaleString()} <span className="text-sm text-indigo-400">XP</span>
                                    </div>
                                    {player.trend === 'up' && (
                                        <div className="flex items-center justify-end gap-1 text-xs font-bold text-emerald-400">
                                            <TrendingUp className="w-3 h-3" /> On Fire
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="bg-indigo-950/80 p-6 flex justify-center border-t border-indigo-400/20">
                    <Link 
                      href="/app/games/ranked/leaderboard"
                      className="flex items-center gap-2 text-indigo-300 hover:text-white font-bold transition-colors"
                    >
                        View Full Rankings <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    </section>
  );
}
