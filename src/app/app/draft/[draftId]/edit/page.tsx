'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, Send, ArrowLeft, Pencil, Eye } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const LAYER_KEYS = [
  { key: 'presentationTimeline', label: 'Presentation' },
  { key: 'hpi', label: 'History of Present Illness' },
  { key: 'history', label: 'Past Medical / Surgical / Social History', type: 'object', subkeys: ['pmh', 'psh', 'meds', 'allergy', 'social', 'family'] },
  { key: 'physicalExam', label: 'Physical Exam', type: 'object', subkeys: ['general', 'cvs', 'rs', 'gi', 'neuro', 'kub', 'msk', 'others'] },
  { key: 'labs', label: 'Laboratory Data', type: 'object', subkeys: ['cbc', 'chemistry', 'others'] },
  { key: 'imaging', label: 'Imaging', type: 'array' },
  { key: 'pathognomonic', label: 'Pathognomonic Clue' },
];

export default function DraftEditPage() {
  const params = useParams();
  const router = useRouter();
  const draftId = params.draftId as string;

  const [draft, setDraft] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [activeLayer, setActiveLayer] = useState(0);

  useEffect(() => {
    const fetchDraft = async () => {
      try {
        const res = await fetch(`/api/drafts/${draftId}`);
        const data = await res.json();
        if (data.ok && data.draft) {
          setDraft(data.draft);
        }
      } catch (e) {
        console.error('Error loading draft:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDraft();
  }, [draftId]);

  const updateLayer = (key: string, value: any) => {
    setDraft((prev: any) => ({
      ...prev,
      contentPublic: {
        ...prev.contentPublic,
        layers: {
          ...prev.contentPublic.layers,
          [key]: value
        }
      }
    }));
  };

  const updatePrivate = (key: string, value: any) => {
    setDraft((prev: any) => ({
      ...prev,
      contentPrivate: {
        ...prev.contentPrivate,
        [key]: value
      }
    }));
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await fetch('/api/studio/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftId,
          edits: {
            title: draft.title,
            contentPublic: draft.contentPublic,
            contentPrivate: draft.contentPrivate,
          }
        })
      });
      const data = await res.json();
      if (data.ok) {
        router.push('/app/community');
      }
    } catch (e) {
      console.error('Error publishing:', e);
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="w-full max-w-2xl mx-auto py-24 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Draft not found</h2>
        <Link href="/app/studio" className="text-indigo-600 hover:underline font-semibold">Back to Studio</Link>
      </div>
    );
  }

  const layers = draft.contentPublic?.layers || {};
  const priv = draft.contentPrivate || {};
  const currentLayerConfig = LAYER_KEYS[activeLayer];

  return (
    <div className="w-full max-w-6xl mx-auto pb-24 pt-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/app/studio" className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3 h-3" /> Back to Studio
          </Link>
          <input
            className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight bg-transparent border-none outline-none w-full focus:ring-0"
            value={draft.title || ''}
            onChange={(e) => setDraft((prev: any) => ({ ...prev, title: e.target.value }))}
            placeholder="Case Title"
          />
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 uppercase">{draft.style}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400">Diff {draft.difficulty}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-800/20 text-amber-700 dark:text-amber-400 uppercase">{draft.status}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/app/draft/${draftId}/play`}
            className="px-4 py-2.5 text-sm font-bold bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg hover:border-indigo-400 transition-colors flex items-center gap-2"
          >
            <Eye className="w-4 h-4" /> Play Preview
          </Link>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="px-5 py-2.5 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-4 h-4" /> {publishing ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-8">
        {/* Layer Nav */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Public Layers</h3>
          {LAYER_KEYS.map((lk, i) => (
            <button
              key={lk.key}
              onClick={() => setActiveLayer(i)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all border",
                activeLayer === i
                  ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300"
                  : "bg-white dark:bg-[#18181B] border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-900"
              )}
            >
              {lk.label}
            </button>
          ))}

          <hr className="border-slate-100 dark:border-zinc-800 my-4" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Private (Answers)</h3>
          <button
            onClick={() => setActiveLayer(100)}
            className={cn(
              "w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all border",
              activeLayer === 100
                ? "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300"
                : "bg-white dark:bg-[#18181B] border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
            )}
          >
            Diagnosis & Teaching
          </button>
        </div>

        {/* Editor Pane */}
        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm min-h-[500px]">
          {activeLayer < LAYER_KEYS.length ? (
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{currentLayerConfig.label}</h2>

              {currentLayerConfig.type === 'object' ? (
                <div className="space-y-5">
                  {(currentLayerConfig.subkeys || []).map((sk: string) => (
                    <div key={sk}>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-2">{sk}</label>
                      <textarea
                        className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-3 text-sm min-h-[80px] focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-y"
                        value={layers[currentLayerConfig.key]?.[sk] || ''}
                        onChange={(e) => {
                          const obj = { ...(layers[currentLayerConfig.key] || {}), [sk]: e.target.value };
                          updateLayer(currentLayerConfig.key, obj);
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : currentLayerConfig.type === 'array' ? (
                <div className="space-y-4">
                  {(layers.imaging || []).map((img: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-4 space-y-3">
                      <label className="block text-xs font-bold uppercase text-slate-500">Type</label>
                      <input className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-sm" value={img.type || ''} readOnly />
                      <label className="block text-xs font-bold uppercase text-slate-500">Caption</label>
                      <textarea
                        className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-sm min-h-[60px] resize-y"
                        value={img.caption || ''}
                        onChange={(e) => {
                          const newImaging = [...(layers.imaging || [])];
                          newImaging[idx] = { ...newImaging[idx], caption: e.target.value };
                          updateLayer('imaging', newImaging);
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <textarea
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-4 text-sm min-h-[200px] focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-y leading-relaxed"
                  value={layers[currentLayerConfig.key] || ''}
                  onChange={(e) => updateLayer(currentLayerConfig.key, e.target.value)}
                />
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-rose-700 dark:text-rose-400 mb-6">Private Content (Hidden During Play)</h2>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Diagnosis</label>
                <input
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-3 text-sm font-bold focus:ring-2 focus:ring-rose-400 focus:outline-none"
                  value={priv.diagnosis || ''}
                  onChange={(e) => updatePrivate('diagnosis', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Aliases (newline separated)</label>
                <textarea
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-3 text-sm min-h-[80px] resize-y"
                  value={(priv.aliases || []).join('\n')}
                  onChange={(e) => updatePrivate('aliases', e.target.value.split('\n').filter((s: string) => s.trim()))}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Rationale</label>
                <textarea
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-3 text-sm min-h-[100px] resize-y"
                  value={priv.answerCheck?.rationale || ''}
                  onChange={(e) => updatePrivate('answerCheck', { ...priv.answerCheck, rationale: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Key Differentials (newline separated)</label>
                <textarea
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-3 text-sm min-h-[80px] resize-y"
                  value={(priv.answerCheck?.keyDifferentials || []).join('\n')}
                  onChange={(e) => updatePrivate('answerCheck', { ...priv.answerCheck, keyDifferentials: e.target.value.split('\n').filter((s: string) => s.trim()) })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Teaching Points (newline separated)</label>
                <textarea
                  className="w-full bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200 rounded-lg p-3 text-sm min-h-[120px] resize-y"
                  value={(priv.teachingPoints || []).join('\n')}
                  onChange={(e) => updatePrivate('teachingPoints', e.target.value.split('\n').filter((s: string) => s.trim()))}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
