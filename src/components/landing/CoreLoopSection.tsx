'use client';

import React from 'react';
import { HelpCircle, XCircle, Search, CheckCircle2, Trophy, ArrowUpCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CoreLoopSection() {
  const steps = [
    { icon: HelpCircle, label: "Read & Guess", color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
    { icon: XCircle, label: "Get it Wrong", color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-500/10" },
    { icon: Search, label: "Unlock Clue", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
    { icon: CheckCircle2, label: "Diagnose", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
    { icon: Trophy, label: "Master It", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
    { icon: ArrowUpCircle, label: "Rank Up", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10" },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#09090B] overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-16 tracking-tight">
          How it hooks you.
        </h2>

        {/* Visual Flow Container */}
        <div className="relative max-w-5xl mx-auto">
          
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-[40px] left-[10%] right-[10%] h-1 bg-slate-100 dark:bg-zinc-800 -z-10" />
          
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6 md:gap-4 relative z-10">
            {steps.map((step, idx) => (
              <div 
                key={idx} 
                className="flex flex-col items-center group"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                <div className={cn(
                  "w-20 h-20 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300",
                  "shadow-sm group-hover:scale-110 group-hover:-translate-y-2 group-hover:shadow-xl",
                  step.bg,
                  step.color
                )}>
                  <step.icon className="w-8 h-8" />
                </div>
                
                <span className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {step.label}
                </span>

                {/* Mobile Connector */}
                {idx < steps.length - 1 && idx % 2 === 0 && (
                   <div className="md:hidden absolute mt-8 translate-x-[120%] text-slate-200 dark:text-zinc-800">
                     <ArrowRight className="w-5 h-5" />
                   </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
