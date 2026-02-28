import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, MessageSquare, ThumbsUp, ThumbsDown, ShieldAlert, CheckCircle2 } from 'lucide-react';
import dbConnect from '@/lib/dbConnect';
import Case from '@/models/Case';
import mongoose from 'mongoose';

export default async function CaseDetailPage({ params }: { params: { id: string } }) {
    await dbConnect();

    // Fetch the case directly server-side
    let caseData = null;
    try {
        if (mongoose.Types.ObjectId.isValid(params.id)) {
            caseData = await Case.findById(params.id).lean();
        }
    } catch (e) {
        console.error("Error fetching case details:", e);
    }

    if (!caseData) {
        return (
            <div className="w-full max-w-5xl mx-auto py-20 text-center animate-in fade-in">
                <h1 className="text-2xl font-bold mb-4">Case Not Found</h1>
                <Link href="/app/community" className="text-indigo-600 hover:underline">Return to Community</Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Nav */}
            <Link href="/app/community" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-2">
                <ArrowLeft className="w-4 h-4" /> Back to Feed
            </Link>

            {/* Header */}
            <header className="bg-white dark:bg-[#18181B] rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 p-8 shadow-sm">
                <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            {caseData.status === 'needs_review' ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                                    <ShieldAlert className="w-3.5 h-3.5" /> Needs Review
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                                </span>
                            )}
                            <span className="text-sm font-bold text-slate-400">• {new Date(caseData.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
                            {caseData.title || 'Untitled Case'}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
                            Systems: {caseData.systemTags?.join(', ')} • Difficulty: {caseData.difficulty}/5 • Style: {caseData.style}
                        </div>
                    </div>
                    
                    <Link 
                        href={`/app/session?mode=ai-review&id=${caseData._id}`}
                        className="shrink-0 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                        <Play className="fill-current w-4 h-4" /> Play to Review Layer by Layer
                    </Link>
                </div>
            </header>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Col - Voting Widget MVP */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 text-xs">
                                {caseData.community?.score || 0}
                            </span>
                            Community Score
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                            Vote to help algorithmically curate the best clinical scenarios for the library. (Note: Play the case first to unlock voting in the Play UX)
                        </p>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl font-bold transition-colors border border-slate-200 dark:border-zinc-800">
                                <ThumbsUp className="w-5 h-5" /> Upvote
                            </button>
                            <button className="flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-zinc-900 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl font-bold transition-colors border border-slate-200 dark:border-zinc-800">
                                <ThumbsDown className="w-5 h-5" /> Downvote
                            </button>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-zinc-800 text-center">
                            <div className="text-xs font-bold text-slate-400 mb-1">REALISM RATING</div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white">
                                {caseData.community?.realismAvg ? caseData.community.realismAvg.toFixed(1) : 'N/A'} <span className="text-base text-slate-400">/ 5.0</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Col - Comments Thread MVP */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 p-6 shadow-sm h-full min-h-[400px]">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 text-lg">
                            <MessageSquare className="w-5 h-5 text-indigo-500" />
                            Discussion Thread
                        </h3>
                        
                        <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 dark:text-slate-400">
                            <MessageSquare className="w-12 h-12 mb-4 text-slate-300 dark:text-zinc-700" />
                            <p className="font-medium text-sm">Comments are coming soon in the next v3 update.</p>
                            <p className="text-xs mt-1">Play the case to leave structured feedback instead.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
