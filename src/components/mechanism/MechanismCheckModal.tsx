'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Shield, Clock, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface MechanismCheckQuestion {
  id: string;
  prompt: string;
  options: string[];
  tags?: string[];
}

interface MechanismCheckModalProps {
  matchId: string;
  playerKey: string;
  questions: MechanismCheckQuestion[];
  deadlineTs: number;
  onComplete: (passed: boolean) => void;
}

export function MechanismCheckModal({
  matchId,
  playerKey,
  questions,
  deadlineTs,
  onComplete,
}: MechanismCheckModalProps) {
  const [answers, setAnswers] = useState<Map<string, number>>(new Map());
  const [timeLeft, setTimeLeft] = useState(Math.max(0, Math.ceil((deadlineTs - Date.now()) / 1000)));
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ pass: boolean; penaltyApplied?: string } | null>(null);
  const submitted = useRef(false);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadlineTs - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        // Auto-submit on timeout
        if (!submitted.current) {
          handleSubmit();
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [deadlineTs]);

  const handleSelect = (questionId: string, optionIndex: number) => {
    if (submitting || result) return;
    setAnswers(prev => new Map(prev).set(questionId, optionIndex));
  };

  const handleSubmit = useCallback(async () => {
    if (submitted.current || submitting) return;
    submitted.current = true;
    setSubmitting(true);

    const answerArray = questions.map(q => ({
      questionId: q.id,
      selectedIndex: answers.get(q.id) ?? -1, // -1 if unanswered
    }));

    try {
      const res = await fetch(`/api/party/matches/${matchId}/mechanism-check/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerKey, answers: answerArray }),
      });

      const data = await res.json();
      setResult(data);

      // Close modal after brief delay
      setTimeout(() => onComplete(data.pass), 2000);
    } catch (e) {
      console.error('Error submitting mechanism check:', e);
      setTimeout(() => onComplete(false), 1000);
    } finally {
      setSubmitting(false);
    }
  }, [answers, matchId, onComplete, playerKey, questions, submitting]);

  const allAnswered = questions.every(q => answers.has(q.id));
  const timerPct = Math.max(0, (timeLeft / 12) * 100);
  const isUrgent = timeLeft <= 4;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden border border-slate-200 dark:border-zinc-800 animate-in zoom-in-95 duration-300">
        {/* Header bar with timer */}
        <div className={cn(
          'px-6 py-4 flex items-center justify-between transition-colors',
          isUrgent
            ? 'bg-rose-500 text-white'
            : 'bg-indigo-600 text-white'
        )}>
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5" />
            <span className="font-bold text-sm">Mechanism Check!</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className={cn('font-mono font-bold text-lg', isUrgent && 'animate-pulse')}>
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* Timer bar */}
        <div className="h-1 bg-slate-100 dark:bg-zinc-800">
          <div
            className={cn(
              'h-full transition-all duration-200 ease-linear',
              isUrgent ? 'bg-rose-500' : 'bg-indigo-500'
            )}
            style={{ width: `${timerPct}%` }}
          />
        </div>

        {/* Result overlay */}
        {result && (
          <div className="p-8 text-center animate-in fade-in duration-300">
            {result.pass ? (
              <>
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  Check Passed!
                </h3>
                <p className="text-sm text-slate-500 mt-1">No penalty applied.</p>
              </>
            ) : (
              <>
                <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400">
                  Check Failed
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {result.penaltyApplied || 'Penalty applied.'}
                </p>
              </>
            )}
          </div>
        )}

        {/* Questions */}
        {!result && (
          <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Answer both correctly to avoid a penalty!
            </p>

            {questions.map((q, qi) => (
              <div key={q.id} className="space-y-2">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {qi + 1}. {q.prompt}
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {q.options.map((opt, oi) => {
                    const letter = String.fromCharCode(65 + oi);
                    const selected = answers.get(q.id) === oi;
                    return (
                      <button
                        key={oi}
                        onClick={() => handleSelect(q.id, oi)}
                        disabled={submitting}
                        className={cn(
                          'text-left px-3 py-2 rounded-lg border text-sm transition-all flex items-start gap-2',
                          selected
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 dark:border-indigo-500/50'
                            : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                        )}
                      >
                        <span className={cn(
                          'flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border mt-0.5',
                          selected
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white dark:bg-zinc-800 text-slate-400 border-slate-300 dark:border-zinc-700'
                        )}>
                          {letter}
                        </span>
                        <span className="text-slate-700 dark:text-slate-300">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-zinc-800 disabled:text-slate-400 text-white rounded-xl text-sm font-bold transition-colors"
            >
              {submitting ? 'Checking…' : 'Submit'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
