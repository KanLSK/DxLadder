'use client';

import React, { useState } from 'react';
import { CheckCircle2, TrendingUp, Sparkles, Rocket } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function PricingSection() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <section id="pricing" className="py-24 bg-white dark:bg-[#09090B] px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header & Toggle */}
        <div className="text-center mb-16 px-4">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
            Simple pricing for focused learning.
          </h2>
          
          <div className="inline-flex items-center bg-slate-100 dark:bg-zinc-800 p-1.5 rounded-2xl mb-8 border border-slate-200 dark:border-zinc-700 mx-auto">
            <button
               onClick={() => setBilling('monthly')}
               className={cn(
                 "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                 billing === 'monthly' ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
               )}
            >
              Monthly
            </button>
            <button
               onClick={() => setBilling('yearly')}
               className={cn(
                 "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                 billing === 'yearly' ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
               )}
            >
              Yearly <span className="text-[10px] uppercase tracking-wider bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md">-20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          
          {/* Free Tier */}
          <div className="bg-slate-50 dark:bg-[#18181B] rounded-3xl p-8 border border-slate-200/60 dark:border-zinc-800 flex flex-col transition-all hover:border-slate-300 dark:hover:border-zinc-700">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-zinc-800 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Basic</h3>
            </div>
            
            <div className="flex items-baseline gap-2 mb-4">
               <span className="text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">$0</span>
               <span className="text-slate-500 font-medium">/forever</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium mb-8">
               Build your daily habit.
            </p>
            
            <ul className="space-y-4 flex-1 mb-8">
               <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300 font-medium text-sm">
                   <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" /> 
                   <span>1 Daily Case (Progressive Disclosure)</span>
               </li>
               <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300 font-medium text-sm">
                   <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" /> 
                   <span>Play up to 3 Games per day (Duel, Arena)</span>
               </li>
               <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300 font-medium text-sm">
                   <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" /> 
                   <span>Community Feed Access & Voting</span>
               </li>
               <li className="flex items-start gap-3 text-slate-500 dark:text-slate-500 font-medium text-sm opacity-50">
                   <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-zinc-700 shrink-0" /> 
                   <span>AI Studio Publishing</span>
               </li>
            </ul>

            <Link 
              href="/app/session?mode=daily" 
              className="w-full py-4 text-center rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
            >
              Start Free
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="relative bg-indigo-600 rounded-3xl p-8 border border-indigo-500 shadow-xl shadow-indigo-600/20 flex flex-col overflow-hidden">
             {/* Decorative gradients */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-50 -mr-20 -mt-20 pointer-events-none" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600 rounded-full blur-3xl opacity-50 -ml-20 -mb-20 pointer-events-none" />
             
             <div className="relative z-10 flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-inner">
                        <Rocket className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Pro</h3>
                </div>
                <div className="bg-indigo-500/50 border border-indigo-400 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-100 flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="w-3 h-3" /> Most Popular
                </div>
             </div>

             <div className="relative z-10 flex items-baseline gap-2 mb-4">
                 <span className="text-5xl font-extrabold text-white tracking-tight">
                    ${billing === 'yearly' ? '8' : '10'}
                 </span>
                 <span className="text-indigo-200 font-medium">/month</span>
             </div>
             {billing === 'yearly' && (
                 <div className="relative z-10 text-sm font-bold text-indigo-300 mb-8">
                     Billed $96 annually
                 </div>
             )}
             {billing === 'monthly' && (
                 <div className="relative z-10 mb-8 h-5" />
             )}
             
             <p className="relative z-10 text-indigo-100 font-medium mb-8">
                 Compete unlimited. Generate cases. Master faster.
             </p>

             <ul className="relative z-10 space-y-4 flex-1 mb-8">
                <li className="flex items-start gap-3 text-white font-medium text-sm">
                    <CheckCircle2 className="w-5 h-5 text-indigo-300 shrink-0" /> 
                    <span>Unlimited Session Cases & System Sprints</span>
                </li>
                <li className="flex items-start gap-3 text-white font-medium text-sm">
                    <CheckCircle2 className="w-5 h-5 text-indigo-300 shrink-0" /> 
                    <span>Unlimited Games (all modes)</span>
                </li>
                <li className="flex items-start gap-3 text-white font-medium text-sm">
                    <CheckCircle2 className="w-5 h-5 text-indigo-300 shrink-0" /> 
                    <span>APK Mode (Full Chart structure)</span>
                </li>
                <li className="flex items-start gap-3 text-white font-medium text-sm">
                    <CheckCircle2 className="w-5 h-5 text-indigo-300 shrink-0" /> 
                    <span>Unlimited AI Studio generation & publishing</span>
                </li>
             </ul>

             <button className="relative z-10 w-full py-4 text-center rounded-xl bg-white text-indigo-900 font-bold hover:bg-slate-50 transition-colors shadow-lg shadow-black/10 active:scale-95">
                 Upgrade to Pro
             </button>
          </div>

        </div>
      </div>
    </section>
  );
}
