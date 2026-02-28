import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VotingPanelProps {
  caseId: string;
  onVoteComplete: () => void;
}

const REASONS = [
  "Too vague/broad",
  "Contradictory hints",
  "Unsafe or incorrect medical info",
  "Missing key discriminating info",
  "Too rare/unhelpful",
  "Other"
];

export function VotingPanel({ caseId, onVoteComplete }: VotingPanelProps) {
  const [vote, setVote] = useState<1 | -1 | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleReason = (reason: string) => {
    setSelectedReasons(prev => 
      prev.includes(reason) 
        ? prev.filter(r => r !== reason)
        : [...prev, reason]
    );
  };

  const handleSubmit = async () => {
    if (!vote) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: caseId,
          vote,
          reasons: vote === -1 ? selectedReasons : []
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setTimeout(() => {
            onVoteComplete();
        }, 1500);
      } else {
        alert(data.message || 'Failed to submit vote');
      }
    } catch (e) {
      console.error(e);
      alert('Network error submitting vote.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
     return (
        <div className="w-full mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-medium">
           <ThumbsUp className="w-4 h-4" />
           <span>Thanks for reviewing! Your feedback improves Doctordle.</span>
        </div>
     );
  }

  return (
    <div className="w-full mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  AI-Generated Case Review
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  High-rated cases are promoted to the permanent library. Was this realistic?
              </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { setVote(1); setSelectedReasons([]); }}
              className={cn(
                "px-4 py-2 rounded-lg flex items-center gap-2 transition-all border text-sm font-medium",
                vote === 1 
                  ? "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500 dark:text-emerald-400 shadow-sm" 
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
              )}
            >
              <ThumbsUp className="w-4 h-4" />
              Realistic
            </button>

            <button
              onClick={() => setVote(-1)}
              className={cn(
                "px-4 py-2 rounded-lg flex items-center gap-2 transition-all border text-sm font-medium",
                vote === -1 
                  ? "bg-red-50 border-red-500 text-red-700 dark:bg-red-500/10 dark:border-red-500 dark:text-red-400 shadow-sm" 
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
              )}
            >
              <ThumbsDown className="w-4 h-4" />
              Needs Work
            </button>
          </div>
      </div>

      {vote === -1 && (
        <div className="mb-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 animate-in fade-in">
          <p className="text-xs font-semibold mb-3 text-slate-700 dark:text-slate-300 flex items-center gap-2">
             <AlertTriangle className="w-3 h-3 text-amber-500" />
             What was wrong? (Select all that apply)
          </p>
          <div className="flex flex-wrap gap-2">
            {REASONS.map(r => (
              <button
                key={r}
                onClick={() => toggleReason(r)}
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] font-medium transition-colors border",
                  selectedReasons.includes(r)
                    ? "bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/60 dark:border-amber-700 dark:text-amber-200"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {vote !== null && (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (vote === -1 && selectedReasons.length === 0)}
            className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white rounded-lg text-sm font-bold transition-colors ml-auto block"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
      )}

    </div>
  );
}
