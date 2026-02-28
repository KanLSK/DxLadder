import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThinkSpaceProps {
  onSubmit: (guess: string) => void;
  disabled: boolean;
  history: string[];
}

export function ThinkSpace({ onSubmit, disabled, history }: ThinkSpaceProps) {
  const [guess, setGuess] = useState('');
  const [isError, setIsError] = useState(false);
  const prevHistoryLength = useRef(history.length);

  // Trigger conversational feedback on wrong guess
  useEffect(() => {
    if (history.length > prevHistoryLength.current) {
       setIsError(true);
       const timer = setTimeout(() => setIsError(false), 2000); // show feedback for 2s
       return () => clearTimeout(timer);
    }
    prevHistoryLength.current = history.length;
  }, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guess.trim() && !disabled) {
      onSubmit(guess.trim());
      setGuess('');
    }
  };

  if (disabled) return null;

  const lastGuess = history.length > 0 ? history[history.length - 1] : null;

  return (
    <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-gradient-to-t from-[#F9FAFB] via-[#F9FAFB]/90 to-transparent dark:from-[#09090B] dark:via-[#09090B]/90 pb-safe z-30 p-4 pt-24 pointer-events-none flex flex-col items-center">
       
       <div className="w-full max-w-2xl mx-auto pointer-events-auto">
            
            {/* Conversational Feedback Bubble */}
            <div className="h-10 flex items-end justify-center mb-4">
                {isError && lastGuess && (
                    <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-xl px-4 py-2 rounded-2xl flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in duration-300">
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Not <span className="text-rose-500 dark:text-rose-400 font-bold capitalize">{lastGuess}</span>. Let's unlock the next piece of data.
                        </span>
                    </div>
                )}
            </div>

            {/* Modern Safari-styled Input Bar */}
            <form onSubmit={handleSubmit} className="relative group">
                <input
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                autoFocus
                placeholder="Submit your working diagnosis..."
                className={cn(
                    "w-full px-6 py-4 pr-16 rounded-2xl text-lg font-medium outline-none transition-all duration-300",
                    "bg-white dark:bg-[#18181B] text-slate-900 dark:text-slate-50",
                    "shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]",
                    isError 
                        ? "border-rose-300 dark:border-rose-500/30 ring-4 ring-rose-500/10" 
                        : "border border-slate-200 dark:border-zinc-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                )}
                />
                
                {/* Send Button */}
                <button
                type="submit"
                disabled={!guess.trim()}
                className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-zinc-800 disabled:text-slate-400 text-white rounded-xl transition-all duration-200 active:scale-95"
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
    </div>
  );
}
