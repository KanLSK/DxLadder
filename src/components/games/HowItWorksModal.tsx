import React from 'react';
import { X, Swords, Trophy, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">How it works</h2>
            <button 
              onClick={onClose}
              className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                <Swords className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Choose your arena</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Play competitively in Ranked Duels to climb the ladder, or create a Private Arena to challenge your friends with custom rules.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Solve the case</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Both players get the same clinical vignette. Request history, physical exam, and labs layer by layer. First to correctly diagnose wins.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Earn rating and glory</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Victory grants ELO rating. Tie-breakers are resolved by score (fewer layers and wrong guesses yield a higher score).
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 pt-0 mt-4">
          <button 
            onClick={onClose}
            className="w-full py-3 px-4 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
