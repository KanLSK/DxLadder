'use client';

import React, { useState, useCallback } from 'react';
import { MechanismQuestion } from './MechanismQuestion';
import { Star, Trophy, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface Question {
  id: string;
  prompt: string;
  options: string[];
  explanation: string;
  tags: string[];
}

interface MechanismRoundProps {
  caseId: string;
  userKey: string;
  questions: Question[];
  traps?: string[];
  onComplete: (mastered: boolean, score: number, total: number) => void;
}

export function MechanismRound({ caseId, userKey, questions, traps, onComplete }: MechanismRoundProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<{ questionId: string; selectedIndex: number }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number; mastered: boolean; wrongIds: string[] } | null>(null);

  const currentQuestion = questions[currentIndex];
  const total = questions.length;
  const answeredCount = answers.length;

  const handleAnswer = useCallback((questionId: string, selectedIndex: number) => {
    setAnswers(prev => [...prev, { questionId, selectedIndex }]);

    // Auto-advance after a brief delay to let user read feedback
    if (currentIndex < total - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 1200);
    }
  }, [currentIndex, total]);

  const handleSubmitAll = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/play/mechanism', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId, userKey, answers }),
      });

      const data = await res.json();
      if (data.ok) {
        setResult(data);
        onComplete(data.mastered, data.score, data.total);

        // Fire celebration if mastered
        if (data.mastered) {
          setTimeout(() => {
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.7 },
              colors: ['#10B981', '#6366F1', '#F59E0B'],
            });
          }, 300);
        }
      }
    } catch (e) {
      console.error('Error submitting mechanism answers:', e);
    } finally {
      setSubmitting(false);
    }
  };

  // Final result screen
  if (result) {
    const percentage = Math.round((result.score / result.total) * 100);
    return (
      <div className="text-center py-6 animate-in fade-in zoom-in-95 duration-500">
        <div className={cn(
          'inline-flex items-center gap-3 px-6 py-3 rounded-2xl mb-4 border',
          result.mastered
            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'
            : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
        )}>
          {result.mastered ? (
            <Star className="w-6 h-6 text-emerald-500 fill-emerald-500" />
          ) : (
            <Trophy className="w-6 h-6 text-amber-500" />
          )}
          <span className={cn(
            'text-lg font-bold',
            result.mastered
              ? 'text-emerald-700 dark:text-emerald-300'
              : 'text-amber-700 dark:text-amber-300'
          )}>
            {result.mastered ? '⭐ Case Mastered!' : `${percentage}% — Keep Climbing!`}
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          You got {result.score} out of {result.total} correct.
          {result.mastered
            ? ' Your understanding of this mechanism is solid.'
            : ' Review the explanations and try related cases.'}
        </p>

        {/* Show traps/misconceptions */}
        {traps && traps.length > 0 && (
          <div className="mt-6 text-left bg-rose-50 dark:bg-rose-500/5 border border-rose-200 dark:border-rose-500/20 rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-2">
              Common Traps
            </h4>
            <ul className="space-y-1.5">
              {traps.map((trap, i) => (
                <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <span className="text-rose-400 mt-0.5">⚠</span>
                  <span>{trap}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress pill */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors duration-300',
                  i < answeredCount
                    ? 'bg-indigo-500'
                    : i === currentIndex
                      ? 'bg-indigo-300 dark:bg-indigo-600 animate-pulse'
                      : 'bg-slate-200 dark:bg-zinc-700'
                )}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {answeredCount}/{total}
          </span>
        </div>
      </div>

      {/* Current question */}
      {currentQuestion && (
        <MechanismQuestion
          key={currentQuestion.id}
          id={currentQuestion.id}
          prompt={currentQuestion.prompt}
          options={currentQuestion.options}
          explanation={currentQuestion.explanation}
          tags={currentQuestion.tags}
          onAnswer={handleAnswer}
          disabled={answeredCount > currentIndex}
        />
      )}

      {/* Submit all when every question is answered */}
      {answeredCount === total && !result && (
        <button
          onClick={handleSubmitAll}
          disabled={submitting}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Grading…
            </>
          ) : (
            <>
              See Results
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
