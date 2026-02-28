'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Play, ShieldCheck, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CaseState } from '@/types/game';

// Helper to reverse map slug to system name
const SLUG_TO_SYSTEM: Record<string, string> = {
  'cardiovascular': 'Cardiovascular',
  'respiratory': 'Respiratory',
  'neurology': 'Neurology',
  'gastrointestinal': 'Gastrointestinal',
  'renal': 'Renal',
  'endocrine': 'Endocrine',
  'hematology': 'Hematology',
  'infectious-disease': 'Infectious Disease',
  'other': 'Other'
};

export default function SystemDetailPage() {
    const params = useParams();
    const router = useRouter();
    const systemSlug = params.system as string;
    
    const [cases, setCases] = useState<CaseState[]>([]);
    const [loading, setLoading] = useState(true);

    const systemName = SLUG_TO_SYSTEM[systemSlug] || 'Unknown System';

    useEffect(() => {
        const fetchCases = async () => {
            try {
                // Fetch all library cases (optimizable later with a dedicated endpoint)
                const res = await fetch('/api/library/list');
                const data = await res.json();
                
                if (data.success && data.cases) {
                    const filtered = data.cases.filter((c: CaseState) => {
                        if (systemSlug === 'other') return !c.systemTags || c.systemTags.length === 0;
                        return c.systemTags?.some(t => t.toLowerCase() === systemName.toLowerCase());
                    });
                    setCases(filtered);
                }
            } catch (e) {
                console.error("Failed to fetch cases for system", e);
            } finally {
                setLoading(false);
            }
        };

        fetchCases();
    }, [systemSlug, systemName]);

    return (
        <div className="w-full max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            {/* Header & Breadcrumb */}
            <div className="mb-8">
                <button 
                   onClick={() => router.push('/app/library')}
                   className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Library
                </button>
                
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                            {systemName}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            {cases.length} {cases.length === 1 ? 'case' : 'cases'} available for practice.
                        </p>
                    </div>
                    
                    <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm transition-colors flex items-center justify-center gap-2 active:scale-95">
                        <Play className="w-4 h-4 fill-current" />
                        Start 3-Case Sprint
                    </button>
                </div>
            </div>

            {/* SaaS Data Table List View */}
            <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 w-16 text-center">Status</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Diagnosis</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Difficulty</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Source</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        Loading cases...
                                    </td>
                                </tr>
                            ) : cases.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                                        No cases found for {systemName}. Generate one in AI Studio!
                                    </td>
                                </tr>
                            ) : (
                                cases.map(c => {
                                    // Use a fake status for aesthetics right now
                                    const isSolved = Math.random() > 0.7; // Mock Solved state

                                    return (
                                        <tr key={c._id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors group">
                                            <td className="px-6 py-4 text-center">
                                                {isSolved ? (
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                                                ) : (
                                                    <Circle className="w-5 h-5 text-slate-300 dark:text-zinc-700 mx-auto" />
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900 dark:text-white mb-1">
                                                    {isSolved && c.answer ? (
                                                        <span className="capitalize">{c.answer}</span>
                                                    ) : (
                                                        <span className="italic text-slate-500 flex items-center gap-2">
                                                            <Lock className="w-3 h-3" /> Undiagnosed Case
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs font-medium text-slate-500 line-clamp-1 max-w-sm">
                                                    {c.hint1}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-1">
                                                    {[1,2,3,4,5].map(star => (
                                                        <div key={star} className={cn(
                                                            "w-1.5 h-1.5 rounded-full",
                                                            star <= c.difficulty ? "bg-amber-400" : "bg-slate-200 dark:bg-zinc-700"
                                                        )} />
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {c.sourceType === 'generated' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-bold border border-indigo-100 dark:border-indigo-500/20">
                                                        <ShieldCheck className="w-3 h-3" /> Community
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex flex-row items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 text-xs font-bold border border-slate-200 dark:border-zinc-700">
                                                        Expert
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link 
                                                    href={`/app/session?mode=library&id=${c._id}`}
                                                    className="inline-flex px-4 py-2 border border-slate-200 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-400 text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors"
                                                >
                                                    Play
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
// Add explicit Lock import which was missing above:
import { Lock } from 'lucide-react';
