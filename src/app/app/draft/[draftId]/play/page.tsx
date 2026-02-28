'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ClinicalChart } from '@/components/session/ClinicalChart';
import { ThinkSpace } from '@/components/session/ThinkSpace';
import { RefreshCw, Send, Pencil, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function DraftPlayPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const draftId = params.draftId as string;

  const [caseData, setCaseData] = useState<any>(null);

  const [currentLayerIndex, setCurrentLayerIndex] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [status, setStatus] = useState<'playing' | 'solved' | 'failed'>('playing');
  const [reveal, setReveal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    const fetchDraft = async () => {
      try {
        const res = await fetch(`/api/drafts/${draftId}/play-public`);
        const data = await res.json();
        if (data.ok && data.case) {
          setCaseData(data.case);
        }
      } catch (e) {
        console.error('Error loading draft:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDraft();
  }, [draftId]);

  const handleGuess = async (guess: string) => {
    if (!caseData || status !== 'playing') {
      return { ok: false, error: 'Cannot submit guess right now' };
    }
    setHistory(prev => [...prev, guess]);

    try {
      const userId = session?.user?.id || 'anonymous';
      const res = await fetch('/api/play/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: draftId,
          guess,
          currentLayerIndex,
          userKey: userId,
        }),
      });

      const result = await res.json();

      if (result.success) {
        if (result.correct) {
          setStatus('solved');
        } else if (result.finished) {
          setStatus('failed');
        }

        if (result.nextLayerIndex !== undefined && result.nextLayerIndex > currentLayerIndex) {
          setCurrentLayerIndex(result.nextLayerIndex);
        }

        if (result.finished && result.reveal) {
          setReveal(result.reveal);
        }
        
        return { ok: true, isWrongGuess: !result.correct && !result.finished };
      }
      return { ok: false, error: result.error || 'Failed to submit guess' };
    } catch (e) {
      console.error('Error submitting guess:', e);
      return { ok: false, error: 'Network error submitting guess' };
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await fetch('/api/studio/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId })
      });
      const data = await res.json();
      if (data.ok) {
        router.push(`/app/community`);
      }
    } catch (e) {
      console.error('Error publishing:', e);
    } finally {
      setPublishing(false);
    }
  };

  const finished = status === 'solved' || status === 'failed';

  // Map the play-public response shape to what ClinicalChart expects
  const chartData = caseData ? {
    ...caseData,
    contentPublic: { layers: caseData.layers },
  } : null;

  return (
    <div className="w-full max-w-5xl mx-auto pb-32 pt-6 animate-in fade-in duration-500">

      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-1">Draft Preview</div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {caseData?.title || 'Loading…'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/app/draft/${draftId}/edit`}
            className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg hover:border-indigo-300 transition-colors flex items-center gap-2"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit Draft
          </Link>
        </div>
      </div>

      {/* Clinical Chart */}
      <ClinicalChartForDraft
        caseData={chartData}
        currentLayerIndex={currentLayerIndex}
        solved={status === 'solved'}
        failed={status === 'failed'}
        reveal={reveal}
      />

      {/* Guess / Post-game */}
      {status === 'playing' ? (
        <ThinkSpace
          onSubmit={handleGuess}
          disabled={loading || status !== 'playing'}
          history={history}
          status={status}
        />
      ) : (
        <div className="mt-12 w-full max-w-xl mx-auto flex flex-col items-center">
          {/* Reveal block */}
          {reveal && (
            <div className="w-full bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 mb-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-white",
                  status === 'solved' ? "bg-emerald-500" : "bg-rose-500"
                )}>
                  {status === 'solved' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                </div>
                <h3 className={cn(
                  "text-lg font-bold",
                  status === 'solved' ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                )}>
                  {status === 'solved' ? 'Correct Diagnosis!' : 'The Correct Diagnosis Was:'}
                </h3>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white capitalize mb-6">{reveal.diagnosis}</p>

              {reveal.rationale && (
                <div className="mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Rationale</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{reveal.rationale}</p>
                </div>
              )}

              {reveal.teachingPoints?.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-3">Clinical Pearls</h4>
                  <ul className="space-y-2">
                    {reveal.teachingPoints.map((tp: string, i: number) => (
                      <li key={i} className="text-sm text-amber-900 dark:text-amber-200 flex items-start gap-2">
                        <span className="opacity-50 mt-0.5">•</span>
                        <span>{tp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Post-game actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {publishing ? 'Publishing...' : 'Publish to Community'}
            </button>
            <div className="px-5 py-2.5 bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-bold tracking-wide text-slate-700 dark:text-slate-300 shadow-sm">
               Data Layers: <span className="text-indigo-600 dark:text-indigo-400">{currentLayerIndex + 1}</span> / 6
            </div>
            <Link
              href={`/app/draft/${draftId}/edit`}
              className="px-6 py-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl font-bold text-slate-700 dark:text-slate-300 hover:border-indigo-300 transition-colors flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" /> Edit Draft
            </Link>
            <Link
              href="/app/studio"
              className="px-6 py-4 text-slate-500 hover:text-slate-700 font-semibold transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Regenerate
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrapper around ClinicalChart that works with the public-only data shape
function ClinicalChartForDraft({ caseData, currentLayerIndex, solved, failed, reveal }: any) {
  if (!caseData) {
    return (
      <div className="w-full h-[50vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-500 font-medium text-sm animate-pulse">Retrieving patient chart…</span>
      </div>
    );
  }

  // Adapt the data for ClinicalChart which expects caseData.contentPublic.layers
  const adaptedData = {
    ...caseData,
    // ClinicalChart looks for content.layers or contentPublic.layers
    content: { layers: caseData.contentPublic?.layers || caseData.layers },
  };

  return (
    <ClinicalChart
      caseData={adaptedData}
      currentLayerIndex={currentLayerIndex}
      solved={solved}
      failed={failed}
    />
  );
}
