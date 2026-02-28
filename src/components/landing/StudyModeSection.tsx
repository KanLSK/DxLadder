'use client';

import React, { useState } from 'react';
import { Target, FileText, ArrowRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function StudyModeSection() {
  const [activeTab, setActiveTab] = useState<'quick' | 'full'>('quick');

  return (
    <section className="py-24 bg-slate-50 dark:bg-zinc-900 border-y border-slate-100 dark:border-zinc-800/80 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4 uppercase">
            Study solo. Compete when ready.
          </h2>
          <p className="text-xl font-medium text-slate-500 dark:text-slate-400">
            Train your intuition in peace. Switch modes depending on your mood.
          </p>
        </div>

        <div className="bg-white dark:bg-[#18181B] rounded-[2rem] border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden flex flex-col md:flex-row">
            
            {/* Left Control Panel */}
            <div className="md:w-1/3 p-8 border-b md:border-b-0 md:border-r border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 flex flex-col justify-center">
                
                <div className="flex flex-col gap-4">
                    <button 
                        onClick={() => setActiveTab('quick')}
                        className={cn(
                            "flex items-center gap-4 p-5 rounded-2xl transition-all text-left",
                            activeTab === 'quick' ? "bg-white dark:bg-zinc-800 shadow-sm border border-slate-200 dark:border-zinc-700" : "hover:bg-slate-100 dark:hover:bg-zinc-800/50"
                        )}
                    >
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", activeTab === 'quick' ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400" : "bg-slate-100 dark:bg-zinc-800 text-slate-500 max-w-[48px]")}>
                            <Zap className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className={cn("font-bold text-lg mb-1", activeTab === 'quick' ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400")}>Quick Mode</h3>
                            <p className="text-sm font-medium text-slate-500">Fast, vignette-style reps</p>
                        </div>
                    </button>

                    <button 
                        onClick={() => setActiveTab('full')}
                        className={cn(
                            "flex items-center gap-4 p-5 rounded-2xl transition-all text-left",
                            activeTab === 'full' ? "bg-white dark:bg-zinc-800 shadow-sm border border-slate-200 dark:border-zinc-700" : "hover:bg-slate-100 dark:hover:bg-zinc-800/50"
                        )}
                    >
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", activeTab === 'full' ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-zinc-800 text-slate-500 max-w-[48px]")}>
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className={cn("font-bold text-lg mb-1", activeTab === 'full' ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400")}>Full Chart Mode</h3>
                            <p className="text-sm font-medium text-slate-500">Realistic hospital EMR view</p>
                        </div>
                    </button>
                </div>

                <div className="mt-12 pt-6 border-t border-slate-200 dark:border-zinc-800">
                    <Link href="/app/session?mode=daily" className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl transition-all">
                        Train Now <Target className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Right Display Area */}
            <div className="md:w-2/3 p-8 bg-[#F8FAFC] dark:bg-black/20 flex items-center justify-center min-h-[400px]">
                {activeTab === 'quick' ? (
                    <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 p-6 animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex gap-2 mb-4">
                            <div className="w-16 h-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full" />
                            <div className="w-8 h-3 bg-slate-100 dark:bg-zinc-800 rounded-full" />
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 font-medium mb-6 leading-relaxed">
                            "65-year-old male presents with sudden weakness in his right arm and difficulty speaking that began 45 minutes ago..."
                        </p>
                        <div className="h-12 w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 rounded-lg flex items-center px-4">
                            <span className="text-slate-400 text-sm font-medium">Type your diagnosis...</span>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full max-w-md bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col">
                        <div className="flex border-b border-slate-200 dark:border-zinc-800 p-2 gap-2 bg-slate-50 dark:bg-zinc-900/50">
                            <div className="px-3 py-1.5 bg-white dark:bg-zinc-800 shadow-sm rounded-md border border-slate-100 dark:border-zinc-700 text-xs font-bold text-slate-800 dark:text-slate-200">Presentation</div>
                            <div className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-500">History</div>
                            <div className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-500">Exam</div>
                        </div>
                        <div className="p-6">
                            <div className="w-1/3 h-4 bg-slate-100 dark:bg-zinc-800 rounded-full mb-4" />
                            <div className="space-y-3">
                                <div className="w-full h-3 bg-slate-50 dark:bg-zinc-800/50 rounded-full" />
                                <div className="w-5/6 h-3 bg-slate-50 dark:bg-zinc-800/50 rounded-full" />
                                <div className="w-4/6 h-3 bg-slate-50 dark:bg-zinc-800/50 rounded-full" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
      </div>
    </section>
  );
}
