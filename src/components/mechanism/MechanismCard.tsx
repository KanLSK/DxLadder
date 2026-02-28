'use client';

import React from 'react';
import { Zap, ChevronRight, SkipForward } from 'lucide-react';

interface MechanismCardProps {
  questionCount: number;
  onStart: () => void;
  onSkip: () => void;
}

export function MechanismCard({ questionCount, onStart, onSkip }: MechanismCardProps) {
  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-500/5 dark:via-purple-500/5 dark:to-pink-500/5 border border-indigo-200 dark:border-indigo-500/20 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 dark:bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Climb the Ladder: Why is this happening?
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
            Answer {questionCount} quick question{questionCount !== 1 ? 's' : ''} to master the mechanism behind this case.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={onStart}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              Start
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={onSkip}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 text-sm font-medium transition-colors"
            >
              <SkipForward className="w-3.5 h-3.5" />
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
