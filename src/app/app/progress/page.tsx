'use client';

import React, { useState, useEffect } from 'react';
import { Target, Activity, CheckCircle2, Trophy, ArrowUpRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProgressPage() {
    const [statsData, setStatsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const res = await fetch('/api/user/progress');
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setStatsData(data);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch progress", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProgress();
    }, []);

    if (loading) {
       return (
           <div className="w-full h-[60vh] flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
              <div className="text-sm font-bold uppercase tracking-widest text-slate-400 animate-pulse">Loading Analytics...</div>
           </div>
       );
    }
    return (
        <div className="w-full max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <header className="mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                    Your Progress
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                    Track your clinical intuition over time.
                </p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                {/* Global Stats */}
                <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 shadow-sm p-6 flex flex-col items-center justify-center text-center">
                   <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                       <CheckCircle2 className="w-8 h-8" />
                   </div>
                   <div className="text-4xl font-extrabold text-slate-900 dark:text-white mb-1">{statsData?.stats?.totalSolved || 0}</div>
                   <div className="text-sm font-bold uppercase tracking-widest text-slate-400">Total Solved</div>
                </div>

                <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 shadow-sm p-6 flex flex-col items-center justify-center text-center">
                   <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
                       <Target className="w-8 h-8" />
                   </div>
                   <div className="text-4xl font-extrabold text-slate-900 dark:text-white mb-1">{statsData?.stats?.avgSteps || 0}</div>
                   <div className="text-sm font-bold uppercase tracking-widest text-slate-400">Avg Steps w/o error</div>
                </div>

                <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 shadow-sm p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 relative z-10">
                       <Trophy className="w-8 h-8" />
                   </div>
                   <div className="text-4xl font-extrabold text-slate-900 dark:text-white mb-1 relative z-10">Top {(statsData?.stats?.rank || 15)}%</div>
                   <div className="text-sm font-bold uppercase tracking-widest text-slate-400 relative z-10">Global Rank</div>
                </div>

            </div>

            {/* Simulated Heatmap area inside a beautiful SaaS graph block */}
            <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 shadow-sm p-8">
                 <div className="flex items-center justify-between mb-8">
                     <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity <span className="text-indigo-500 font-normal ml-2">Last 30 Days</span></h2>
                     <button className="text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1">
                         View Details <ArrowUpRight className="w-4 h-4" />
                     </button>
                 </div>

                 {/* Fake Github-style Heatmap */}
                 <div className="flex gap-1 overflow-x-auto pb-4 custom-scrollbar">
                     {Array.from({ length: 30 }).map((_, col) => (
                         <div key={col} className="space-y-1">
                             {Array.from({ length: 4 }).map((_, row) => {
                                 const intensity = Math.random();
                                 let colorCls = "bg-slate-100 dark:bg-zinc-800"; // Empty
                                 if (intensity > 0.8) colorCls = "bg-indigo-600 dark:bg-indigo-500";
                                 else if (intensity > 0.5) colorCls = "bg-indigo-400 dark:bg-indigo-400/80";
                                 else if (intensity > 0.2) colorCls = "bg-indigo-200 dark:bg-indigo-500/30";

                                 return (
                                     <div key={`${col}-${row}`} className={cn("w-4 h-4 md:w-6 md:h-6 rounded-sm opacity-80 hover:opacity-100 transition-opacity cursor-pointer", colorCls)} />
                                 );
                             })}
                         </div>
                     ))}
                 </div>
            </div>

            {/* Radar / Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 shadow-sm p-8">
                     <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Strength & Weakness Radar</h2>
                     <div className="aspect-square w-full max-w-[300px] mx-auto bg-slate-50 dark:bg-zinc-900 rounded-full border border-slate-100 dark:border-zinc-800 flex items-center justify-center relative shadow-inner">
                         {/* Placeholder for real radar chart */}
                         <Activity className="w-16 h-16 text-slate-200 dark:text-zinc-800 animate-pulse" />
                         <span className="absolute bottom-6 text-xs font-bold uppercase tracking-widest text-slate-400">Loading Radar...</span>
                     </div>
                 </div>
                 
                 <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 shadow-sm p-8 flex flex-col justify-between">
                     <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Focus Recommendation</h2>
                        <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/20 rounded-xl mb-6">
                            <h3 className="font-bold text-amber-800 dark:text-amber-400 mb-1">{statsData?.recommendation?.system || 'General'}</h3>
                            <p className="text-sm text-amber-700/80 dark:text-amber-300/80 font-medium">{statsData?.recommendation?.message || 'Keep practicing.'}</p>
                        </div>
                     </div>
                     <button className="w-full py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold transition-transform active:scale-95 shadow-md">
                         Start {statsData?.recommendation?.system || ''} Sprint
                     </button>
                 </div>
            </div>

        </div>
    );
}
