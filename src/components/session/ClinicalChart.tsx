import React, { useState, useEffect } from 'react';
import { Lock, Check, X, FileText, Activity, TestTube, Microscope, Target, Stethoscope, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClinicalChartProps {
  caseData: any;
  currentLayerIndex: number;
  solved: boolean;
  failed: boolean;
  // Optional reveal data to show after solve — prevents accidental answer leak
  reveal?: {
    diagnosis: string;
    rationale?: string;
    teachingPoints?: string[];
    keyDifferentials?: string[];
  } | null;
}

const LAYER_CONFIG = [
  { key: 'presentationTimeline', label: 'Presentation', icon: FileText },
  { key: 'hpi', label: 'HPI', icon: ClipboardList },
  { key: 'history', label: 'History (PMH, PSH, etc)', icon: FileText },
  { key: 'physicalExam', label: 'Physical Exam', icon: Stethoscope },
  { key: 'labs', label: 'Laboratory Data', icon: TestTube },
  { key: 'imaging', label: 'Imaging', icon: Microscope },
  { key: 'pathognomonic', label: 'Pathognomonic Clue', icon: Target }
];

export function ClinicalChart({ caseData, currentLayerIndex, solved, failed, reveal }: ClinicalChartProps) {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    setActiveTab(currentLayerIndex);
  }, [currentLayerIndex]);

  if (!caseData) {
    return (
      <div className="w-full h-[50vh] flex flex-col items-center justify-center space-y-4">
         <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
         <span className="text-slate-500 font-medium text-sm animate-pulse">Retrieving patient chart…</span>
      </div>
    );
  }

  const finished = solved || failed;

  // Resolve layers from whichever schema shape we receive
  const layers = caseData.contentPublic?.layers
    || caseData.content?.layers
    || caseData.payload?.content?.layers
    || {};

  return (
    <div className="w-full max-w-5xl mx-auto pb-48 pt-6">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Clinical Chart
                </h1>
                <div className="flex items-center gap-3 mt-2 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    <span>
                        Difficulty {'★'.repeat(caseData.difficulty || 0)}{'☆'.repeat(5 - (caseData.difficulty || 0))}
                    </span>
                    {caseData.sourceType === 'generated' && (
                        <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-500/20">
                            AI Beta
                        </span>
                    )}
                </div>
            </div>
            <div className="px-4 py-2 bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
               Data Layers: {currentLayerIndex + 1} / 7
            </div>
        </div>

        {/* Main Chart */}
        <div className="flex flex-col gap-6">
            {/* Top Tab Nav (Horizontal Scroll) */}
            <div className="w-full flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {LAYER_CONFIG.map((config, i) => {
                    const isRevealed = i <= currentLayerIndex || finished;
                    const isActive = activeTab === i;
                    return (
                        <button
                            key={i}
                            disabled={!isRevealed}
                            onClick={() => setActiveTab(i)}
                            className={cn(
                                "flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 border whitespace-nowrap shrink-0",
                                isActive
                                    ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 shadow-sm"
                                    : isRevealed
                                        ? "bg-white dark:bg-[#18181B] border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-900"
                                        : "bg-slate-50/50 dark:bg-[#09090B] border-transparent text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60"
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <config.icon className={cn("w-4 h-4", isActive ? "text-indigo-600 dark:text-indigo-400" : isRevealed ? "text-slate-400" : "text-slate-300 dark:text-zinc-700")} />
                                <span className="font-semibold text-sm">{config.label}</span>
                            </div>
                            {!isRevealed && <Lock className="w-3.5 h-3.5" />}
                        </button>
                    );
                })}
            </div>

            {/* Right Reading Pane */}
            <div className="flex-1 bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 md:p-10 shadow-sm min-h-[400px]">

                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-4">
                    <span className="text-indigo-600 dark:text-indigo-400">
                        {React.createElement(LAYER_CONFIG[activeTab].icon, { className: "w-5 h-5" })}
                    </span>
                    {LAYER_CONFIG[activeTab].label}
                </h2>

                <div className="bg-slate-50 dark:bg-zinc-900/40 rounded-xl p-6 md:p-8 border border-slate-100 dark:border-zinc-800/60 min-h-[200px] flex flex-col pt-8 relative">
                    <div className="absolute top-0 left-6 right-6 h-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-zinc-700 to-transparent opacity-50"></div>

                    <div className="prose prose-slate dark:prose-invert md:prose-lg max-w-none text-slate-700 dark:text-slate-200 leading-relaxed font-serif animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {activeTab <= currentLayerIndex || finished ? (
                             <RenderLayerContent layers={layers} tabConfigKey={LAYER_CONFIG[activeTab].key} />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center py-12 text-slate-400 dark:text-slate-500">
                                <Lock className="w-8 h-8 mb-3 opacity-20" />
                                <span className="font-sans text-sm tracking-widest uppercase font-bold opacity-60">Sequence Locked</span>
                                <span className="font-sans text-xs mt-2 max-w-xs">Submit a diagnosis attempt below to unlock the next piece of clinical data.</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reveal section — only if we have explicit reveal data */}
                {finished && reveal && activeTab === 6 && (
                    <div className="mt-12 pt-12 border-t border-slate-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-500">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={cn(
                                "flex items-center justify-center w-10 h-10 rounded-full text-white shadow-sm",
                                solved ? "bg-emerald-500" : "bg-rose-500"
                            )}>
                                {solved ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                            </div>
                            <h3 className={cn(
                                "text-lg font-bold tracking-tight",
                                solved ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                            )}>
                                {solved ? `Diagnosis Reached (${currentLayerIndex + 1} steps)` : "The Correct Diagnosis was"}
                            </h3>
                        </div>

                        <div className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white capitalize tracking-tight mb-8">
                            {reveal.diagnosis}
                        </div>

                        {reveal.rationale && (
                            <div className="mb-6">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Rationale</h4>
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{reveal.rationale}</p>
                            </div>
                        )}

                        {reveal.teachingPoints && reveal.teachingPoints.length > 0 && (
                            <div className="bg-slate-50 dark:bg-zinc-900/50 rounded-xl p-6 border border-slate-100 dark:border-zinc-800/80">
                                <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4">Clinical Pearls</h4>
                                <ul className="space-y-3">
                                    {reveal.teachingPoints.map((tp: string, i: number) => (
                                        <li key={i} className="text-slate-700 dark:text-slate-300 font-medium flex items-start gap-3">
                                            <span className="text-indigo-400 mt-1.5 opacity-50">•</span>
                                            <span className="leading-relaxed">{tp}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}

function RenderLayerContent({ layers, tabConfigKey }: { layers: any, tabConfigKey: string }) {
    if (!layers) return <p className="italic text-slate-500">No data available for this layer.</p>;

    const layerData = layers[tabConfigKey];
    if (!layerData) return <p className="italic text-slate-500">Data unavailable for this section.</p>;

    // Simple string
    if (typeof layerData === 'string') {
        return <p className="whitespace-pre-wrap">{layerData}</p>;
    }

    // Array (e.g. imaging)
    if (Array.isArray(layerData)) {
        return (
            <div className="space-y-4">
                {layerData.map((img: any, idx: number) => (
                    <div key={idx} className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 p-4 rounded-xl">
                        <strong className="block text-sm uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">{img.type} Scanner</strong>
                        <p>{img.caption}</p>
                    </div>
                ))}
            </div>
        )
    }

    // Object (history, physicalExam, labs) — render as labeled paragraphs, NOT JSON
    if (typeof layerData === 'object') {
        const entries = Object.entries(layerData).filter(([_, val]) => val && typeof val === 'string' && (val as string).trim().length > 0);
        if (entries.length === 0) return <p className="italic text-slate-500">Unremarkable.</p>;

        return (
            <div className="space-y-4">
                {entries.map(([key, val]) => (
                    <div key={key}>
                        <strong className="uppercase text-xs tracking-widest text-slate-500 dark:text-slate-400 block mb-1">{key}</strong>
                        <p className="whitespace-pre-wrap">{String(val)}</p>
                    </div>
                ))}
            </div>
        );
    }

    return null;
}
