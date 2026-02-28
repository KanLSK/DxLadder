import React from 'react';
import Link from 'next/link';
import { Sparkles, TrendingUp, Clock, Star, Tag, ChevronRight, MessageSquare, ArrowUp, ArrowDown, Activity } from 'lucide-react';
import dbConnect from '@/lib/dbConnect';
import Case from '@/models/Case';

export const dynamic = 'force-dynamic';

export default async function CommunityPage() {
    let cases: any[] = [];
    try {
        await dbConnect();
        cases = await Case.find({
            status: { $in: ['needs_review', 'community_approved', 'library_promoted'] }
        })
        .sort({ 'community.score': -1, createdAt: -1 })
        .limit(20)
        .select('title systemTags difficulty style status community createdAt')
        .lean();
    } catch (e) {
        console.error("Failed to fetch community cases server-side", e);
    }

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
                        <Sparkles className="w-3 h-3 fill-current" />
                        Community Hub
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                        Case Feed
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-base max-w-2xl">
                        Discover, review, and discuss AI-generated and community-submitted clinical cases. Help promote the best content to the permanent library.
                    </p>
                </div>
                
                <Link 
                    href="/app/studio"
                    className="shrink-0 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-sm active:scale-95 flex items-center gap-2"
                >
                    <Sparkles className="w-4 h-4" />
                    Generate New Case
                </Link>
            </header>

            {/* Feed Controls */}
            <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-slate-200 dark:border-zinc-800">
                <button className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Hot
                </button>
                <button className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                    <Clock className="w-4 h-4" /> New
                </button>
                <button className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                    <Star className="w-4 h-4" /> Top
                </button>

                <div className="h-6 w-px bg-slate-200 dark:bg-zinc-800 mx-2" />

                <button className="px-4 py-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-lg text-sm font-bold transition-colors">
                    Needs Review
                </button>
                <button className="px-4 py-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-lg text-sm font-bold transition-colors">
                    Approved
                </button>
            </div>

            {/* Feed List */}
            <div className="space-y-4">
                {cases.length === 0 ? (
                    <div className="text-center py-20 text-slate-500 font-medium">
                        No cases found in the feed. Be the first to generate one in the AI Studio!
                    </div>
                ) : (
                    cases.map((c: any) => (
                        <Link 
                            href={`/app/case/${c._id}`} 
                            key={c._id} 
                            className="block group bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:border-indigo-500/40 hover:shadow-md transition-all cursor-pointer"
                        >
                            <div className="flex items-start gap-4">
                                {/* Vote Column */}
                                <div className="flex flex-col items-center gap-0.5 shrink-0 bg-slate-50 dark:bg-zinc-900 rounded-lg p-2 min-w-[50px]">
                                    <div className="text-slate-400 group-hover:text-emerald-500 transition-colors">
                                        <ArrowUp className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-slate-700 dark:text-slate-300">
                                        {c.community?.score || 0}
                                    </span>
                                    <div className="text-slate-400 group-hover:text-rose-500 transition-colors">
                                        <ArrowDown className="w-5 h-5" />
                                    </div>
                                </div>
                                
                                {/* Content Column */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        {c.status === 'needs_review' ? (
                                             <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded">
                                                Needs Review
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded">
                                                Approved
                                            </span>
                                        )}
                                        <span className="text-[10px] font-bold text-slate-400">
                                            • {new Date(c.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                                        {c.title || 'Untitled Case'}
                                    </h3>
                                    
                                    <div className="flex flex-wrap items-center gap-2">
                                        {c.systemTags?.map((tag: string) => (
                                            <span key={tag} className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md">
                                                <Tag className="w-3 h-3" /> {tag}
                                            </span>
                                        ))}
                                        <span className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md">
                                            <Activity className="w-3 h-3" /> Diff {c.difficulty}/5
                                        </span>
                                        <span className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md capitalize">
                                            {c.style}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Column */}
                                <div className="hidden sm:flex flex-col items-end justify-between h-full py-1 shrink-0 pl-4 border-l border-slate-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-sm">
                                        <MessageSquare className="w-4 h-4" /> 0
                                    </div>
                                    <div className="mt-8 flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 dark:bg-zinc-800 text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
