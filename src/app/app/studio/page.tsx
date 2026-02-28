'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, BrainCircuit, Play, Check, X, Loader2, RefreshCw, XCircle, LayoutDashboard, Shuffle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const SYSTEM_OPTIONS = [
    { id: 'Random', label: '🎲 Random' },
    { id: 'Cardiovascular', label: 'Cardiovascular' },
    { id: 'Respiratory', label: 'Respiratory' },
    { id: 'Neurology', label: 'Neurology' },
    { id: 'Gastrointestinal', label: 'GI' },
    { id: 'Renal', label: 'Renal / KUB' },
    { id: 'Endocrine', label: 'Endocrine' },
    { id: 'Hematology', label: 'Hematology' },
    { id: 'Infectious Disease', label: 'Infectious' },
] as const;

type StudioState =
    | { status: "idle" }
    | { status: "generating"; progressStep: number; startedAt: number }
    | { status: "validating"; progressStep: number }
    | { status: "done"; draftId: string; summary: any }
    | { status: "error"; message: string; recoverable: boolean };

const GENERATION_STEPS = [
    "Planning case structure",
    "Writing Presentation & HPI",
    "Building Physical Exam",
    "Generating Labs & Imaging",
    "Creating differentials + teaching points",
    "Packaging into DxLadder format"
];

const VALIDATION_STEPS = [
    "Consistency check",
    "Disclosure check",
    "Clinical grading"
];

export default function AIStudioPage() {
    const [state, setState] = useState<StudioState>({ status: 'idle' });
    const abortControllerRef = useRef<AbortController | null>(null);
    const router = useRouter();

    const [params, setParams] = useState({
        systemTags: ['Random'] as string[],
        difficulty: 3,
        style: 'apk',
        targetAudience: 'clinical',
        dataDensity: 'moderate',
        noiseLevel: 'realistic',
        redHerring: 'mild',
        timeline: 'acute'
    });

    // Auto-advance progress step while generating
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (state.status === 'generating') {
            timer = setInterval(() => {
                setState((s) => {
                    if (s.status === 'generating' && s.progressStep < GENERATION_STEPS.length - 1) {
                        return { ...s, progressStep: s.progressStep + 1 };
                    }
                    return s;
                });
            }, 1200);
        } else if (state.status === 'validating') {
             timer = setInterval(() => {
                setState((s) => {
                    if (s.status === 'validating' && s.progressStep < VALIDATION_STEPS.length - 1) {
                        return { ...s, progressStep: s.progressStep + 1 };
                    }
                    return s;
                });
            }, 800);
        }
        return () => clearInterval(timer);
    }, [state.status]);

    const handleParamChange = (field: string, value: any) => {
        setParams(prev => ({ ...prev, [field]: value }));
    };

    const handleSystemToggle = (systemId: string) => {
        if (isInputDisabled) return;
        setParams(prev => {
            if (systemId === 'Random') {
                return { ...prev, systemTags: ['Random'] };
            }
            // Remove 'Random' if present, then toggle this system
            let next = prev.systemTags.filter(t => t !== 'Random');
            if (next.includes(systemId)) {
                next = next.filter(t => t !== systemId);
            } else {
                next = [...next, systemId];
            }
            // If nothing selected, fall back to Random
            if (next.length === 0) next = ['Random'];
            return { ...prev, systemTags: next };
        });
    };

    const handleCancel = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setState({ status: 'idle' });
    };

    const handleGenerate = async () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();

        setState({ status: 'generating', progressStep: 0, startedAt: Date.now() });

        try {
            const res = await fetch('/api/studio/generate', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ params }),
                signal: abortControllerRef.current.signal
            });

            setState({ status: 'validating', progressStep: 0 });
            const data = await res.json();

            setTimeout(() => {
                if (data.ok && data.draftId) {
                    // SUCCESS: show brief done state then redirect to play
                    setState({ status: 'done', draftId: data.draftId, summary: data.summary });
                    // Auto-redirect to play the draft after 1.5s
                    setTimeout(() => {
                        router.push(`/app/draft/${data.draftId}/play`);
                    }, 1500);
                } else {
                    setState({ 
                        status: 'error', 
                        message: data.error || "Failed to generate a valid case.", 
                        recoverable: true 
                    });
                }
            }, 1200);

        } catch (e: any) {
            if (e.name === 'AbortError') {
                console.log("Generation cancelled.");
            } else {
                setState({ 
                    status: 'error', 
                    message: "An unexpected error occurred.", 
                    recoverable: true 
                });
            }
        }
    };

    const isInputDisabled = state.status === 'generating' || state.status === 'validating';

    return (
        <div className="w-full max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <header className="mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
                    <Sparkles className="w-3 h-3 fill-current" />
                    AI Studio
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                    Case Generator
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-base max-w-2xl">
                    Set parameters, generate a draft, then play it with answers hidden. Publish to Community when ready.
                </p>
            </header>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Left: Parameters */}
                <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 shadow-sm p-6 flex flex-col lg:h-[720px]">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <BrainCircuit className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Case Parameters</h2>
                    </div>

                    <div className="space-y-5 flex-1 pr-2 overflow-y-auto custom-scrollbar">
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Style</label>
                            <select disabled={isInputDisabled} className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm disabled:opacity-50" value={params.style} onChange={(e) => handleParamChange('style', e.target.value)}>
                                <option value="vignette">Vignette (Short & Punchy)</option>
                                <option value="osce">OSCE (Clinical Skills Focus)</option>
                                <option value="apk">APK (Long form, Deep synthesis)</option>
                            </select>
                        </div>

                        {/* System / Topic Selection */}
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                                System / Topic
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {SYSTEM_OPTIONS.map(sys => {
                                    const isSelected = params.systemTags.includes(sys.id);
                                    return (
                                        <button
                                            key={sys.id}
                                            type="button"
                                            disabled={isInputDisabled}
                                            onClick={() => handleSystemToggle(sys.id)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                                                isSelected
                                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-500/25"
                                                    : "bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                                            )}
                                        >
                                            {sys.label}
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                                Select one or more systems. &quot;Random&quot; lets the AI choose freely.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2 flex justify-between"><span>Difficulty (1-5)</span><span className="text-indigo-500">Tier {params.difficulty}</span></label>
                            <input type="range" min="1" max="5" disabled={isInputDisabled} value={params.difficulty} onChange={(e) => handleParamChange('difficulty', parseInt(e.target.value))} className="w-full accent-indigo-600 disabled:opacity-50" />
                            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-wider"><span>P1 Intern</span><span>Specialist</span></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Clinical Noise</label>
                                <select disabled={isInputDisabled} className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm disabled:opacity-50" value={params.noiseLevel} onChange={(e) => handleParamChange('noiseLevel', e.target.value)}>
                                    <option value="clean">Clean (Textbook)</option>
                                    <option value="realistic">Realistic</option>
                                    <option value="high">High (Distracting)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Red Herrings</label>
                                <select disabled={isInputDisabled} className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm disabled:opacity-50" value={params.redHerring} onChange={(e) => handleParamChange('redHerring', e.target.value)}>
                                    <option value="none">None</option>
                                    <option value="mild">Mild</option>
                                    <option value="significant">Significant</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Target Audience</label>
                            <select disabled={isInputDisabled} className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm disabled:opacity-50" value={params.targetAudience} onChange={(e) => handleParamChange('targetAudience', e.target.value)}>
                                <option value="preclinical">Preclinical Student</option>
                                <option value="clinical">Clinical Student</option>
                                <option value="intern">Intern / Resident</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-100 dark:border-zinc-800 shrink-0">
                        {state.status === 'idle' || state.status === 'error' || state.status === 'done' ? (
                            <button onClick={handleGenerate} className="w-full px-4 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2">
                                <Play className="fill-current w-4 h-4" /> 
                                {state.status === 'done' ? 'Generate Another' : 'Generate Draft'}
                            </button>
                        ) : state.status === 'generating' ? (
                            <div className="flex gap-3">
                                <button disabled className="flex-1 px-4 py-4 bg-indigo-600/50 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-wait">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Generating…
                                </button>
                                <button onClick={handleCancel} className="px-6 py-4 bg-slate-100 dark:bg-zinc-800 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl font-bold transition-colors">Cancel</button>
                            </div>
                        ) : (
                            <button disabled className="w-full px-4 py-4 bg-amber-500/50 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-wait">
                                <RefreshCw className="w-4 h-4 animate-spin" /> Validating…
                            </button>
                        )}
                    </div>
                </div>

                {/* Right: Status Panel */}
                <div className="bg-slate-50 dark:bg-[#09090B] rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 min-h-[400px] lg:h-[620px] shadow-inner overflow-hidden flex flex-col">
                    {state.status === 'idle' && (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-in fade-in duration-500">
                            <div className="w-20 h-20 mb-6 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center"><LayoutDashboard className="w-10 h-10 text-slate-400 dark:text-zinc-600" /></div>
                            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">No draft yet</h3>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-sm">Choose parameters and generate a draft. You'll play it with answers hidden before publishing.</p>
                        </div>
                    )}

                    {state.status === 'generating' && (
                        <div className="flex flex-col justify-center h-full p-10 animate-in fade-in duration-500">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 rounded-2xl"><Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" /></div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Generating case…</h3>
                                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">Gemini is synthesizing {params.style === 'apk' ? 'an APK-style clinical chart' : 'a clinical vignette'}.</p>
                                </div>
                            </div>
                            <div className="space-y-4 mb-8">
                                {GENERATION_STEPS.map((step, idx) => {
                                    const isCompleted = idx < state.progressStep;
                                    const isCurrent = idx === state.progressStep;
                                    return (
                                        <div key={idx} className={cn("flex items-center gap-3 p-3 rounded-xl transition-all duration-300", isCurrent ? "bg-white dark:bg-zinc-900 shadow-sm border border-slate-200 dark:border-zinc-800 scale-[1.02]" : "opacity-60 grayscale")}>
                                            <div className={cn("flex items-center justify-center w-6 h-6 rounded-full shrink-0 transition-colors", isCompleted ? "bg-emerald-500 text-white" : isCurrent ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 animate-pulse" : "bg-slate-200 dark:bg-zinc-800 text-slate-400")}>
                                                {isCompleted ? <Check className="w-3.5 h-3.5" /> : isCurrent ? <div className="w-1.5 h-1.5 rounded-full bg-current" /> : null}
                                            </div>
                                            <span className={cn("text-sm font-bold", isCurrent ? "text-indigo-900 dark:text-indigo-100" : "text-slate-600 dark:text-slate-400")}>{step}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="text-xs text-center text-slate-400 font-medium">AI synthesis can take 10–25 seconds.</p>
                        </div>
                    )}

                    {state.status === 'validating' && (
                        <div className="flex flex-col justify-center h-full p-10 animate-in fade-in duration-500 bg-amber-50/50 dark:bg-amber-900/10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-amber-100 dark:bg-amber-500/20 rounded-2xl"><RefreshCw className="w-8 h-8 text-amber-600 dark:text-amber-400 animate-spin" /></div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Checking consistency…</h3>
                                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">Running the automated critic phase.</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {VALIDATION_STEPS.map((step, idx) => {
                                    const isCompleted = idx < state.progressStep;
                                    const isCurrent = idx === state.progressStep;
                                    return (
                                        <div key={idx} className={cn("flex items-center gap-3 p-3 rounded-xl transition-all duration-300", isCurrent ? "bg-white dark:bg-zinc-900 shadow-sm border border-slate-200 dark:border-zinc-800" : "opacity-60")}>
                                            <div className={cn("flex items-center justify-center w-6 h-6 rounded-full shrink-0 transition-colors", isCompleted ? "bg-amber-500 text-white" : isCurrent ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 animate-pulse" : "bg-slate-200 dark:bg-zinc-800 text-slate-400")}>
                                                {isCompleted ? <Check className="w-3.5 h-3.5" /> : isCurrent ? <div className="w-1.5 h-1.5 rounded-full bg-current" /> : null}
                                            </div>
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{step}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {state.status === 'done' && (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-in fade-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 mb-6 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"><Check className="w-10 h-10" /></div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Draft Ready!</h3>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-sm mb-2">{state.summary?.title}</p>
                            <p className="text-xs text-slate-400 animate-pulse">Redirecting to play preview…</p>
                        </div>
                    )}

                    {state.status === 'error' && (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-in fade-in duration-500">
                            <XCircle className="w-16 h-16 text-rose-500 mb-6" />
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Something went wrong</h3>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-sm mb-8">{state.message}</p>
                            <button onClick={() => setState({ status: 'idle' })} className="px-6 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white font-bold rounded-xl shadow-sm hover:border-slate-300 transition-colors">Try again</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
