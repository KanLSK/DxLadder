'use client';

import React, { useState, useEffect } from 'react';
import { Flame, CheckCircle2, Trophy, ArrowRight, Play, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/user/me');
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setUser(data.user);
                        // Save the user ID into localStorage so that subsequent case solves
                        // can attach the userId (since we don't have a secure cookie session yet)
                        localStorage.setItem('dxladder_uid', data.user.id);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch user data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    if (loading) {
       return (
           <div className="w-full h-[60vh] flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
              <div className="text-sm font-bold uppercase tracking-widest text-slate-400 animate-pulse">Loading Profile...</div>
           </div>
       );
    }
    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <header className="mb-10">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
                    Good morning, {user?.displayName || 'Doctor'}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-base font-medium">
                    Ready for your daily clinical reasoning warm-up?
                </p>
            </header>

            {/* Top Widgets Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-[#18181B] border border-slate-200/60 dark:border-zinc-800/60 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-rose-500 mb-2">
                        <Flame className="w-4 h-4 fill-current" />
                        <span className="text-xs font-bold uppercase tracking-wider">Streak</span>
                    </div>
                    <div className="text-3xl font-bold dark:text-white">{user?.stats?.currentStreak || 0} <span className="text-sm font-medium text-slate-400">days</span></div>
                </div>
                <div className="bg-white dark:bg-[#18181B] border border-slate-200/60 dark:border-zinc-800/60 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-emerald-500 mb-2">
                        <CheckCircle2 className="w-4 h-4 fill-current" />
                        <span className="text-xs font-bold uppercase tracking-wider">Solved</span>
                    </div>
                    <div className="text-3xl font-bold dark:text-white">{user?.stats?.totalSolved || 0}</div>
                </div>
                <div className="bg-white dark:bg-[#18181B] border border-slate-200/60 dark:border-zinc-800/60 rounded-xl p-4 shadow-sm hidden md:block">
                    <div className="flex items-center gap-2 text-amber-500 mb-2">
                        <Trophy className="w-4 h-4 fill-current" />
                        <span className="text-xs font-bold uppercase tracking-wider">Rank</span>
                    </div>
                    <div className="text-3xl font-bold dark:text-white">Top {(user?.stats?.rank || 15)}%</div>
                </div>
                <div className="bg-white dark:bg-[#18181B] border border-slate-200/60 dark:border-zinc-800/60 rounded-xl p-4 shadow-sm hidden md:block">
                    <div className="flex items-center gap-2 text-indigo-500 mb-2">
                        <ArrowRight className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Focus</span>
                    </div>
                    <div className="text-lg font-bold dark:text-white truncate">Neurology</div>
                </div>
            </div>

            {/* Hero Actions Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                {/* Primary Daily Action */}
                <div className="lg:col-span-2 relative overflow-hidden bg-slate-900 rounded-2xl p-8 flex flex-col justify-between items-start min-h-[240px] shadow-[0_20px_40px_-15px_rgba(79,70,229,0.3)] group cursor-pointer border border-slate-800">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 pointer-events-none" />
                    <div className="absolute -right-10 -top-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
                    
                    <div className="relative z-10 max-w-sm">
                        <div className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full inline-block mb-4 border border-indigo-500/30">
                            Session Available
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2 tracking-tight">
                            Daily Case: Unknown
                        </h2>
                        <p className="text-indigo-200 font-medium mb-6">
                            A 45-year-old male presents with sudden onset flank pain...
                        </p>
                    </div>
                    
                    <Link href="/app/session?mode=daily" className="relative z-10 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center gap-2 shadow-lg active:scale-95">
                        <Play className="w-4 h-4 fill-current" />
                        Start 5-Min Session
                    </Link>
                </div>

                {/* Secondary Actions */}
                <div className="flex flex-col gap-6">
                    <Link href="/app/session?mode=practice" className="flex-1 bg-white dark:bg-[#18181B] border border-slate-200/60 dark:border-zinc-800/60 rounded-2xl p-6 shadow-sm hover:border-indigo-500/30 transition-colors group">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1">
                            System Sprint
                        </h3>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">
                            3 cases back-to-back.
                        </p>
                        <div className="text-indigo-600 dark:text-indigo-400 text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Start Sprint <ArrowRight className="w-4 h-4" />
                        </div>
                    </Link>

                    <Link href="/app/library" className="flex-1 bg-white dark:bg-[#18181B] border border-slate-200/60 dark:border-zinc-800/60 rounded-2xl p-6 shadow-sm hover:border-indigo-500/30 transition-colors group">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1">
                            Browse Library
                        </h3>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">
                            Review by organ system.
                        </p>
                        <div className="text-indigo-600 dark:text-indigo-400 text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Explore <ArrowRight className="w-4 h-4" />
                        </div>
                    </Link>
                </div>
            </div>

            {/* Bottom Row - Recent Activity */}
            <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">
                    Recent Activity
                </h3>
                <div className="bg-white dark:bg-[#18181B] border border-slate-200/60 dark:border-zinc-800/60 rounded-2xl overflow-hidden shadow-sm">
                    {(!user?.recentActivity || user.recentActivity.length === 0) ? (
                        <div className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 font-medium text-sm">
                            No recent activity found. Start a session to see your progress!
                        </div>
                    ) : (
                        user.recentActivity.map((activity: any) => {
                            const dateObj = new Date(activity.date);
                            const today = new Date();
                            const diffTime = Math.abs(today.getTime() - dateObj.getTime());
                            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                            const dateStr = diffDays === 0 ? 'Today' : diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;

                            return (
                                <div key={activity.id} className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800/60 last:border-0 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer">
                                    <div>
                                        <h4 className="font-semibold text-slate-800 dark:text-zinc-200">{activity.title}</h4>
                                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                                            <span className="bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">{activity.system}</span>
                                            <span>•</span>
                                            <span className={activity.solved ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                                                {activity.solved ? `Solved in ${activity.attempts} steps` : 'Failed'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-sm font-semibold text-slate-400">
                                        {dateStr}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

        </div>
    );
}
