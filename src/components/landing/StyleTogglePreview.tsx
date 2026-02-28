'use client';

import React, { useState } from 'react';
import { AlignLeft, LayoutList, FileText, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function StyleTogglePreview() {
  const [style, setStyle] = useState<'vignette' | 'apk'>('vignette');

  return (
    <section className="py-24 bg-slate-50 dark:bg-[#09090B] border-y border-slate-100 dark:border-zinc-800/80 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        
        {/* Left: Copy & Toggle */}
        <div className="flex flex-col items-start text-left z-10">
          <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-4 flex items-center gap-2">
            <LayoutList className="w-4 h-4" /> Reading Modes
          </h3>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
            Reads like a PDF,<br />plays like an app.
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-10">
            Choose how you consume clinical data. Use <strong>Vignette mode</strong> for rapid-fire board-style questions, or switch to <strong>APK mode</strong> for structured, realistic chart review.
          </p>

          {/* Interactive Toggle */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-2 rounded-2xl flex items-center shadow-sm w-full max-w-sm mb-8">
            <button 
                onClick={() => setStyle('vignette')}
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2", 
                  style === 'vignette' ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
            >
                <AlignLeft className="w-4 h-4" /> Quick Vignette
            </button>
            <button 
                onClick={() => setStyle('apk')}
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2", 
                  style === 'apk' ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
            >
                <FileText className="w-4 h-4" /> APK Long-form
            </button>
          </div>
          
          <Link href="/app/session?mode=daily" className="inline-flex items-center gap-2 font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Try it in the app <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Right: Interactive Preview Window */}
        <div className="relative aspect-[4/5] md:aspect-square w-full max-w-md mx-auto">
            {/* Background decorative blob */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-3xl rounded-full scale-90" />
            
            <div className="relative h-full w-full bg-white dark:bg-[#18181B] rounded-3xl border border-slate-200/60 dark:border-zinc-800/80 shadow-2xl overflow-hidden flex flex-col">
                
                {/* Mock Header */}
                <div className="h-14 border-b border-slate-100 dark:border-zinc-800 flex items-center px-4 bg-slate-50/50 dark:bg-zinc-900/50 shrink-0">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center mr-3">
                        <span className="text-[10px] font-bold">PT</span>
                    </div>
                    <div>
                        <div className="h-3 w-32 bg-slate-800 dark:bg-slate-200 rounded-full mb-1.5" />
                        <div className="h-2 w-20 bg-slate-300 dark:bg-zinc-600 rounded-full" />
                    </div>
                </div>

                {/* Content Area Morphing */}
                <div className="flex-1 p-6 overflow-hidden relative">
                    
                    {/* Vignette Content */}
                    <div className={cn(
                        "absolute inset-0 p-6 transition-all duration-500 ease-out flex flex-col gap-4",
                        style === 'vignette' ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8 pointer-events-none"
                    )}>
                        <div className="p-5 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-100 dark:border-zinc-800/80">
                            <div className="h-3.5 w-full bg-slate-700 dark:bg-slate-300 rounded-full mb-3" />
                            <div className="h-3.5 w-full bg-slate-700 dark:bg-slate-300 rounded-full mb-3" />
                            <div className="h-3.5 w-3/4 bg-slate-700 dark:bg-slate-300 rounded-full" />
                        </div>
                        <div className="p-5 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-100 dark:border-zinc-800/80">
                           <div className="h-3.5 w-full bg-slate-700 dark:bg-slate-300 rounded-full mb-3" />
                           <div className="h-3.5 w-5/6 bg-slate-700 dark:bg-slate-300 rounded-full" />
                        </div>
                        <div className="p-5 bg-slate-50/50 dark:bg-zinc-800/20 rounded-2xl border border-slate-100/50 dark:border-zinc-800/50 mt-auto opacity-50 blur-[1px]">
                           <div className="h-3.5 w-1/2 bg-slate-400 dark:bg-zinc-600 rounded-full mb-3" />
                           <div className="h-3.5 w-1/3 bg-slate-400 dark:bg-zinc-600 rounded-full" />
                        </div>
                    </div>

                    {/* APK Content */}
                    <div className={cn(
                        "absolute inset-0 p-6 transition-all duration-500 ease-out pb-12",
                        style === 'apk' ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8 pointer-events-none"
                    )}>
                        <div className="space-y-6">
                            {/* HPI Section */}
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    History of Present Illness
                                </h4>
                                <div className="space-y-2.5 pl-3 border-l-[3px] border-indigo-100 dark:border-indigo-500/20">
                                    <div className="h-3 w-full bg-slate-600 dark:bg-slate-300 rounded-full" />
                                    <div className="h-3 w-11/12 bg-slate-600 dark:bg-slate-300 rounded-full" />
                                    <div className="h-3 w-4/5 bg-slate-600 dark:bg-slate-300 rounded-full" />
                                </div>
                            </div>
                            
                            {/* Vitals Section */}
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                    Vitals
                                </h4>
                                <div className="grid grid-cols-2 gap-3 pl-3 border-l-[3px] border-rose-100 dark:border-rose-500/20">
                                    <div className="flex items-center gap-2"><span className="text-xs font-bold text-slate-400">HR</span><div className="h-3 w-10 bg-slate-800 dark:bg-slate-200 rounded" /></div>
                                    <div className="flex items-center gap-2"><span className="text-xs font-bold text-slate-400">BP</span><div className="h-3 w-16 bg-slate-800 dark:bg-slate-200 rounded" /></div>
                                    <div className="flex items-center gap-2"><span className="text-xs font-bold text-slate-400">RR</span><div className="h-3 w-8 bg-slate-800 dark:bg-slate-200 rounded" /></div>
                                    <div className="flex items-center gap-2"><span className="text-xs font-bold text-slate-400">T</span><div className="h-3 w-12 bg-slate-800 dark:bg-slate-200 rounded" /></div>
                                </div>
                            </div>

                            {/* Labs Section (Blurred) */}
                            <div className="opacity-50 blur-[2px]">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Laboratory Results
                                </h4>
                                <div className="space-y-2 pl-3 border-l-[3px] border-emerald-100 dark:border-emerald-500/20">
                                    <div className="h-3 w-3/4 bg-slate-400 dark:bg-zinc-500 rounded-full" />
                                    <div className="h-3 w-1/2 bg-slate-400 dark:bg-zinc-500 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating input mock common to both */}
                <div className="absolute bottom-6 left-6 right-6 h-12 bg-white dark:bg-zinc-800 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200 dark:border-zinc-700 flex items-center px-4 justify-between z-20">
                    <span className="text-sm font-medium text-slate-400">Submit diagnosis...</span>
                    <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center">
                        <ArrowRight className="w-3 h-3" />
                    </div>
                </div>

            </div>
        </div>

      </div>
    </section>
  );
}
