'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Wind, Brain, Activity, Droplet, Candy, Snowflake, Stethoscope, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Global config
const SYSTEM_CONFIG = [
  { id: 'Cardiovascular', slug: 'cardiovascular', label: 'Cardiovascular', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10' },
  { id: 'Respiratory', slug: 'respiratory', label: 'Respiratory', icon: Wind, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-500/10' },
  { id: 'Neurology', slug: 'neurology', label: 'Neurology', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
  { id: 'Gastrointestinal', slug: 'gastrointestinal', label: 'Gastrointestinal', icon: Activity, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  { id: 'Renal', slug: 'renal', label: 'Renal / KUB', icon: Droplet, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  { id: 'Endocrine', slug: 'endocrine', label: 'Endocrine', icon: Candy, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-500/10' },
  { id: 'Hematology', slug: 'hematology', label: 'Hematology', icon: Droplet, color: 'text-red-500 fill-red-500/20', bg: 'bg-red-50 dark:bg-red-500/10' },
  { id: 'Infectious Disease', slug: 'infectious-disease', label: 'Infectious Disease', icon: Snowflake, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  { id: 'Other', slug: 'other', label: 'Multisystem', icon: Stethoscope, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-500/10' }
];

export default function LibraryOverviewPage() {
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCases = async () => {
            try {
                // Just fetch metadata or fetch all and locally group. For MVP fetch all is fine.
                const res = await fetch('/api/library/list');
                const data = await res.json();
                
                if (data.success && data.cases) {
                    const groupCounts: Record<string, number> = {};
                    SYSTEM_CONFIG.forEach(sys => { groupCounts[sys.id] = 0; });
                    
                    data.cases.forEach((c: any) => {
                        let placed = false;
                        if (c.systemTags && c.systemTags.length > 0) {
                            c.systemTags.forEach((tag: string) => {
                                const matched = SYSTEM_CONFIG.find(s => s.id.toLowerCase() === tag.toLowerCase());
                                if (matched) {
                                    groupCounts[matched.id]++;
                                    placed = true;
                                }
                            });
                        }
                        if (!placed) groupCounts['Other']++;
                    });
                    
                    setCounts(groupCounts);
                }
            } catch (e) {
                console.error("Failed to load library data", e);
            } finally {
                setLoading(false);
            }
        };

        fetchCases();
    }, []);

    return (
        <div className="w-full max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Header */}
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                        Case Library
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-base">
                        Master clinical reasoning system by system.
                    </p>
                </div>
                
                {/* Global Library Stats/Actions */}
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm hover:border-indigo-300 transition-colors">
                        Filter & Sort
                    </button>
                    <Link href="/app/session?mode=practice" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white border border-transparent rounded-lg text-sm font-semibold shadow-sm transition-colors text-center">
                        Random Sprint
                    </Link>
                </div>
            </header>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SYSTEM_CONFIG.map(sys => {
                    const count = counts[sys.id] || 0;
                    if (!loading && count === 0) return null; // hide empty systems

                    return (
                        <Link 
                            key={sys.id}
                            href={`/app/library/${sys.slug}`}
                            className={cn(
                                "group bg-white dark:bg-[#18181B] rounded-2xl p-6 border border-slate-200/60 dark:border-zinc-800/60 shadow-sm hover:border-indigo-500/50 hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between min-h-[160px]",
                                loading && "opacity-50 pointer-events-none"
                            )}
                        >
                            <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-indigo-50/50 dark:from-indigo-500/5 to-transparent pointer-events-none" />
                            
                            <div className="flex items-start justify-between relative z-10 mb-6">
                                <div className={cn("p-3 rounded-xl", sys.bg)}>
                                    <sys.icon className={cn("w-6 h-6", sys.color)} />
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold dark:text-white">
                                        {loading ? '-' : count}
                                    </div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Cases
                                    </div>
                                </div>
                            </div>
                            
                            <div className="relative z-10 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {sys.label}
                                </h2>
                                <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                            </div>
                        </Link>
                    )
                })}
            </div>

            {!loading && Object.values(counts).every(c => c === 0) && (
                 <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 mt-8">
                     No cases found in the library database.
                 </div>
            )}
        </div>
    );
}
