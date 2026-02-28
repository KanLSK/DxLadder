import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThinkSpaceProps {
  onSubmit: (guess: string) => Promise<{ ok: boolean, error?: string, isWrongGuess?: boolean }>;
  disabled: boolean;
  history: string[];
  status: 'playing' | 'solved' | 'failed';
}

export function ThinkSpace({ onSubmit, disabled, history, status }: ThinkSpaceProps) {
  const [guess, setGuess] = useState('');
  const [isError, setIsError] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (guess.trim() && !disabled && !isSubmitting) {
      setIsSubmitting(true);
      setCustomError(null);
      
      const submittedGuess = guess.trim();
      
      const res = await onSubmit(submittedGuess);
      
      setIsSubmitting(false);

      if (res.ok) {
        setGuess('');
        if (res.isWrongGuess) {
          setIsError(true);
          setTimeout(() => setIsError(false), 2000);
        }
      } else {
        setCustomError(res.error || 'Something went wrong');
        setIsError(true);
        setTimeout(() => setIsError(false), 2500);
      }
    }
  };

  if (disabled) return null;

  const lastGuess = history.length > 0 ? history[history.length - 1] : null;

  return (
    <div className="w-full pointer-events-auto flex flex-col justify-end">
        {/* Conversational Feedback Bubble */}
        <div className="h-10 flex items-end justify-center mb-4">
            {isError && (
                <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-xl px-4 py-2 rounded-2xl flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in duration-300">
                    <Sparkles className={cn("w-4 h-4", customError ? "text-rose-500" : "text-indigo-500")} />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {customError ? (
                          customError
                        ) : lastGuess ? (
                          <>Not <span className="text-rose-500 dark:text-rose-400 font-bold capitalize">{lastGuess}</span>. Let's unlock the next piece of data.</>
                        ) : null}
                    </span>
                </div>
            )}
        </div>

        {/* Modern Safari-styled Input Bar */}
        <form onSubmit={handleSubmit} className="relative group w-full">
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              disabled={disabled || isSubmitting}
              autoFocus
              placeholder="Submit your working diagnosis..."
              className={cn(
                  "w-full px-6 py-4 pr-16 rounded-2xl text-lg font-medium outline-none transition-all duration-300",
                  "bg-slate-50 dark:bg-[#18181B] text-slate-900 dark:text-slate-50",
                  "shadow-inner dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] disabled:opacity-50",
                  isError 
                      ? "border-rose-300 dark:border-rose-500/30 ring-4 ring-rose-500/10" 
                      : "border border-slate-200 dark:border-zinc-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-[#27272A]"
              )}
            />
            
            {/* Send Button */}
            <button
              type="submit"
              disabled={!guess.trim() || disabled || isSubmitting}
              className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-zinc-800 disabled:text-slate-400 text-white rounded-xl transition-all duration-200 active:scale-95"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
        </form>

        <div className="mt-3 text-center">
            <p className="text-xs font-semibold text-slate-400 dark:text-zinc-500 tracking-wide uppercase">
                Press Enter to submit
            </p>
        </div>
    </div>
  );
}
