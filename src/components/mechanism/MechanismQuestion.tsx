'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface MechanismQuestionProps {
  id: string;
  prompt: string;
  options: string[];
  explanation: string;
  tags: string[];
  onAnswer: (questionId: string, selectedIndex: number) => void;
  disabled?: boolean;
}

export function MechanismQuestion({
  id,
  prompt,
  options,
  explanation,
  tags,
  onAnswer,
  disabled = false,
}: MechanismQuestionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleSubmit = () => {
    if (selectedIndex === null || submitted) return;
    setSubmitted(true);
    onAnswer(id, selectedIndex);
  };

  // After parent grades, it can set isCorrect via callback
  // For now we show the submitted state and explanation
  const handleSelect = (index: number) => {
    if (submitted || disabled) return;
    setSelectedIndex(index);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Prompt */}
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed mb-4">
        {prompt}
      </p>

      {/* Options */}
      <div className="space-y-2 mb-4">
        {options.map((option, i) => {
          const letter = String.fromCharCode(65 + i); // A, B, C, D
          const isSelected = selectedIndex === i;

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={submitted || disabled}
              className={cn(
                'w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 flex items-start gap-3',
                isSelected && !submitted
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 dark:border-indigo-500/50 shadow-sm'
                  : submitted && isSelected
                    ? 'border-amber-400 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-500/50'
                    : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 hover:border-slate-300 dark:hover:border-zinc-700',
                (submitted || disabled) && 'cursor-default opacity-90'
              )}
            >
              <span
                className={cn(
                  'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border',
                  isSelected && !submitted
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : submitted && isSelected
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white dark:bg-zinc-800 text-slate-500 border-slate-300 dark:border-zinc-700'
                )}
              >
                {letter}
              </span>
              <span className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed pt-0.5">
                {option}
              </span>
            </button>
          );
        })}
      </div>

      {/* Submit button */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={selectedIndex === null || disabled}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-zinc-800 disabled:text-slate-400 text-white rounded-xl text-sm font-bold transition-colors"
        >
          Submit Answer
        </button>
      )}

      {/* Post-submit: explanation toggle */}
      {submitted && explanation && (
        <div className="mt-3">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            {showExplanation ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
            {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
          </button>
          {showExplanation && (
            <div className="mt-2 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-lg border border-slate-100 dark:border-zinc-800 animate-in fade-in duration-200">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
