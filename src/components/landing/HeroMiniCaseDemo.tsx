'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, RefreshCw, FileText, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

const DEMO_CLUES = [
  "35-year-old female presents to the ED with sudden onset shortness of breath and right-sided pleuritic chest pain.",
  "She returned yesterday from a 14-hour flight from Tokyo. PMH is significant only for oral contraceptive use.",
  "Vitals: HR 115, RR 24, SpO2 93% on room air. Exam: Clear lungs, right calf is mildly swollen and tender."
];

const SYNONYMS = ['pulmonary embolism', 'pe', 'pulmonary embolus'];

export function HeroMiniCaseDemo() {
  const [cluesRevealed, setCluesRevealed] = useState(1);
  const [guess, setGuess] = useState('');
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong'>('playing');
  const [isApkMode, setIsApkMode] = useState(false);

  // Auto-reveal for presentation purposes if left idle too long (optional, skipping for now to let user interact)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim() || status === 'correct') return;

    const normalizedGuess = guess.toLowerCase().trim();
    if (SYNONYMS.includes(normalizedGuess)) {
      setStatus('correct');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4F46E5', '#10B981', '#F59E0B']
      });
    } else {
      setStatus('wrong');
      if (cluesRevealed < DEMO_CLUES.length) {
        setTimeout(() => {
          setCluesRevealed(prev => Math.min(prev + 1, DEMO_CLUES.length));
          setStatus('playing');
          setGuess('');
        }, 800);
      }
    }
  };

  const resetDemo = () => {
    setCluesRevealed(1);
    setGuess('');
    setStatus('playing');
  };

  return (
    <div className="relative w-full aspect-[4/5] sm:aspect-square md:aspect-[4/3] rounded-3xl bg-white dark:bg-[#18181B] border border-slate-200/60 dark:border-zinc-800/80 shadow-2xl flex flex-col justify-between overflow-hidden">
      
      {/* Top Bar Mock */}
      <div className="flex flex-col border-b border-slate-100 dark:border-zinc-800/80">
        <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <div className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-zinc-800/50 px-3 py-1 rounded-full flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-indigo-500" />
                Case #4092
            </div>
        </div>
        
        {/* Style Toggle */}
        <div className="px-4 pb-3 flex items-center justify-center">
            <div className="bg-slate-100 dark:bg-zinc-800/50 p-1 rounded-xl flex items-center text-xs font-bold w-full max-w-[240px]">
                <button 
                  onClick={() => setIsApkMode(false)}
                  className={cn(
                    "flex-1 py-1.5 rounded-lg transition-all",
                    !isApkMode ? "bg-white dark:bg-zinc-700 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  Vignette
                </button>
                <button 
                  onClick={() => setIsApkMode(true)}
                  className={cn(
                    "flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5",
                    isApkMode ? "bg-white dark:bg-zinc-700 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  <FileText className="w-3.5 h-3.5" /> APK
                </button>
            </div>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 p-5 md:p-6 overflow-y-auto overflow-x-hidden relative flex flex-col">
        {/* Vignette Mode */}
        {!isApkMode ? (
          <div className="space-y-4 flex-1">
            {DEMO_CLUES.slice(0, cluesRevealed).map((clue, idx) => (
              <div 
                key={idx} 
                className="p-4 bg-slate-50 dark:bg-zinc-800/30 border border-slate-100 dark:border-zinc-800 rounded-2xl animate-in slide-in-from-bottom-2 fade-in duration-500 text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium"
              >
                {clue}
              </div>
            ))}
            {cluesRevealed < DEMO_CLUES.length && status !== 'correct' && (
              <div className="p-4 bg-slate-50/50 dark:bg-zinc-800/10 border border-slate-100/50 dark:border-zinc-800/50 rounded-2xl blur-[2px] opacity-40 select-none">
                <div className="h-4 w-3/4 bg-slate-400 dark:bg-zinc-600 rounded-full mb-2" />
                <div className="h-4 w-1/2 bg-slate-400 dark:bg-zinc-600 rounded-full" />
              </div>
            )}
          </div>
        ) : (
          /* APK Mode Preview */
          <div className="space-y-6 flex-1 animate-in fade-in duration-300">
             <div className="border-l-4 border-indigo-500 pl-4 py-1">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">HPI</h4>
                <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 font-medium">35-year-old female presents to the ED with sudden onset shortness of breath and right-sided pleuritic chest pain.</p>
             </div>
             
             {cluesRevealed > 1 && (
               <div className="border-l-4 border-emerald-500 pl-4 py-1 animate-in slide-in-from-left-2 fade-in">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">PMH & Social</h4>
                  <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 font-medium pb-2">Returned yesterday from 14-hour flight from Tokyo.</p>
                  <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 font-medium"><span className="text-slate-400">Medications:</span> Oral contraceptives</p>
               </div>
             )}

             {cluesRevealed > 2 && (
               <div className="border-l-4 border-rose-500 pl-4 py-1 animate-in slide-in-from-left-2 fade-in">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Physical Exam</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm md:text-base text-slate-700 dark:text-slate-300 font-medium">
                      <div><span className="text-slate-400">HR:</span> <span className="text-rose-500 font-bold">115</span></div>
                      <div><span className="text-slate-400">RR:</span> <span className="text-rose-500 font-bold">24</span></div>
                      <div><span className="text-slate-400">SpO2:</span> <span className="text-rose-500 font-bold">93%</span></div>
                      <div><span className="text-slate-400">Extremities:</span> Right calf swollen/tender</div>
                  </div>
               </div>
             )}
          </div>
        )}

        {/* Status Overlay */}
        {status === 'wrong' && (
          <div className="absolute inset-x-0 bottom-4 flex justify-center animate-in slide-in-from-bottom-2 fade-in duration-300 z-10">
            <div className="bg-rose-500 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
              Incorrect. Unlocking next clue...
            </div>
          </div>
        )}

        {status === 'correct' && (
          <div className="absolute inset-0 bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-md z-20 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500 p-6 text-center">
            
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(16,185,129,0.5)] mb-6 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase">Diagnosis Correct!</h3>
            <p className="text-emerald-600 dark:text-emerald-400 font-bold text-xl mb-8">+50 XP</p>
            
            {/* Rank Up Animation */}
            <div className="w-full max-w-xs space-y-4 mb-8">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-slate-500 uppercase">Current Rank</span>
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-lg animate-pulse">
                  <span>Novice II</span>
                  <ChevronRight className="w-4 h-4" />
                  <span>Novice III</span>
                </div>
              </div>
              
              {/* Fake XP Bar */}
              <div className="h-4 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden relative shadow-inner">
                 <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-0 animate-[fillBar_1.5s_ease-out_forwards]" />
                 <style dangerouslySetInnerHTML={{__html: `
                   @keyframes fillBar {
                     0% { width: 45%; }
                     100% { width: 100%; }
                   }
                 `}} />
              </div>
            </div>
            
            <button 
              onClick={resetDemo}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] flex items-center gap-2"
            >
              Play Another <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-slate-50 dark:bg-zinc-900/50 border-t border-slate-100 dark:border-zinc-800 relative z-10">
        <form onSubmit={handleSubmit} className="relative group">
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            disabled={status !== 'playing'}
            placeholder="Enter diagnosis..."
            className={cn(
              "w-full px-5 py-3.5 pr-14 rounded-xl text-base font-medium outline-none transition-all duration-300",
              "bg-white dark:bg-[#18181B] text-slate-900 dark:text-white",
              "shadow-sm border border-slate-200 dark:border-zinc-700",
              status === 'wrong' ? "border-rose-500 ring-2 ring-rose-500/20" : "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            )}
          />
          <button
            type="submit"
            disabled={!guess.trim() || status !== 'playing'}
            className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-zinc-800 disabled:text-slate-400 text-white rounded-lg transition-all duration-200"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
        <div className="mt-3 flex justify-between items-center text-xs font-bold">
            <span className="text-slate-400 uppercase tracking-widest">{cluesRevealed} / 3 Clues</span>
            <button onClick={resetDemo} className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors flex items-center gap-1">
                Reset <RefreshCw className="w-3 h-3" />
            </button>
        </div>
      </div>
    </div>
  );
}
