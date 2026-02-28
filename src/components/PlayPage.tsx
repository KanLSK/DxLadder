'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ClinicalChart } from './session/ClinicalChart';
import { ThinkSpace } from './session/ThinkSpace';
import { VotingPanel } from './VotingPanel';
import { MechanismCard } from './mechanism/MechanismCard';
import { MechanismRound } from './mechanism/MechanismRound';
import { RefreshCw, Trophy, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

export function PlayPage() {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get('mode') || 'daily';
  const { data: session } = useSession();
  
  const [mode, setMode] = useState<'daily' | 'practice' | 'ai' | 'library'>(modeParam as any);
  
  const [caseData, setCaseData] = useState<any>(null);
  const [currentLayerIndex, setCurrentLayerIndex] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [status, setStatus] = useState<'playing' | 'solved' | 'failed'>('playing');
  const [reveal, setReveal] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Mechanism Round state
  const [mechanismQuestions, setMechanismQuestions] = useState<any>(null);
  const [showMechanismRound, setShowMechanismRound] = useState(false);
  const [mechanismSkipped, setMechanismSkipped] = useState(false);
  const [mastered, setMastered] = useState(false);
  const [mechanismScore, setMechanismScore] = useState<{ score: number; total: number } | null>(null);

  // Fire confetti celebration
  const fireConfetti = useCallback(() => {
    const duration = 2500;
    const end = Date.now() + duration;

    const colors = ['#10B981', '#6366F1', '#F59E0B', '#EC4899', '#8B5CF6'];

    // Initial big burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors,
    });

    // Continuous side cannons
    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }

      confetti({
        particleCount: 30,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors,
      });
      confetti({
        particleCount: 30,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors,
      });
    }, 250);
  }, []);

  useEffect(() => {
    if (modeParam && ['daily', 'practice', 'ai', 'library'].includes(modeParam)) {
        if (modeParam !== mode) {
            setMode(modeParam as any);
        }
    }
  }, [modeParam, mode]);

  useEffect(() => {
    loadNewCase(mode);
  }, [mode]);

  const loadNewCase = async (currentMode: string) => {
    setLoading(true);
    try {
      setCaseData(null);
      setCurrentLayerIndex(0);
      setHistory([]);
      setStatus('playing');
      setReveal(null);
      setMechanismQuestions(null);
      setShowMechanismRound(false);
      setMechanismSkipped(false);
      setMastered(false);
      setMechanismScore(null);

      let endpoint = '';
      const idParam = searchParams.get('id');
      
      if (idParam && currentMode === 'library') {
          endpoint = `/api/library/case?id=${idParam}&mode=library`;
      } else if (idParam && currentMode === 'ai-review') {
          endpoint = `/api/library/case?id=${idParam}&mode=ai-review`;
      } else if (currentMode === 'practice' || currentMode === 'daily') {
        endpoint = `/api/library/case?mode=${currentMode}`;
      } else {
        endpoint = `/api/library/case?mode=practice`;
      }

      const res = await fetch(endpoint);
      const data = await res.json();
      
      if (data.success && data.case) {
        setCaseData(data.case);
        setCurrentLayerIndex(0);
      } else {
        console.error('Failed to load case:', data.message);
      }
    } catch (e) {
      console.error('Error loading case:', e);
    } finally {
      setLoading(false);
    }
  };

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
          caseId: caseData._id,
          guess: guess,
          currentLayerIndex: currentLayerIndex,
          userKey: userId,
        }),
      });

      const result = await res.json();

      if (result.success) {
        if (result.correct) {
          setStatus('solved');
          // Fire confetti celebration!
          setTimeout(() => fireConfetti(), 100);
        } else if (result.finished) {
          setStatus('failed');
        }

        if (result.nextLayerIndex !== undefined && result.nextLayerIndex > currentLayerIndex) {
          setCurrentLayerIndex(result.nextLayerIndex);
        }

        // Only set reveal data when the game is finished
        if (result.finished && result.reveal) {
          setReveal(result.reveal);
        }

        // Store mechanism questions from reveal
        if (result.mechanismQuestions) {
          setMechanismQuestions(result.mechanismQuestions);
        }
        
        return { ok: true, isWrongGuess: !result.correct && !result.finished };
      }
      return { ok: false, error: result.error || 'Failed to submit guess' };

    } catch (e) {
      console.error('Error submitting guess:', e);
      return { ok: false, error: 'Network error submitting guess' };
    }
  };

  // Combine stepChain + compensation questions for the round
  const allMechanismQuestions = mechanismQuestions
    ? [...(mechanismQuestions.stepChain || []), ...(mechanismQuestions.compensation || [])]
    : [];

  const handleMechanismComplete = (isMastered: boolean, score: number, total: number) => {
    setMastered(isMastered);
    setMechanismScore({ score, total });
    setShowMechanismRound(false);
  };

  return (
    <div className="w-full relative min-h-[calc(100vh-64px)]">
      
      <ClinicalChart
        caseData={caseData}
        currentLayerIndex={currentLayerIndex}
        solved={status === 'solved'}
        failed={status === 'failed'}
        reveal={reveal}
      />

      {status === 'playing' ? (
        <ThinkSpace
          onSubmit={handleGuess}
          disabled={loading || status !== 'playing'}
          history={history}
          status={status}
        />
      ) : (
        <div className="mt-12 w-full max-w-xl mx-auto flex flex-col items-center pb-24">
            
            {/* Success celebration message */}
            {status === 'solved' && (
              <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl mb-3">
                  {mastered ? (
                    <Star className="w-6 h-6 text-emerald-600 dark:text-emerald-400 fill-emerald-500" />
                  ) : (
                    <Trophy className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  )}
                  <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                    {mastered ? '⭐ Case Mastered!' : 'Brilliant Diagnosis!'}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  You nailed it in {history.length} {history.length === 1 ? 'attempt' : 'attempts'} using {currentLayerIndex + 1} layers.
                  {mechanismScore && ` Mechanism: ${mechanismScore.score}/${mechanismScore.total}`}
                </p>
              </div>
            )}

            {/* Mechanism Round — only on solve, not fail */}
            {status === 'solved' && allMechanismQuestions.length > 0 && (
              <>
                {showMechanismRound ? (
                  <div className="w-full mb-8">
                    <MechanismRound
                      caseId={caseData._id}
                      userKey={session?.user?.id || 'anonymous'}
                      questions={allMechanismQuestions}
                      traps={mechanismQuestions?.traps}
                      onComplete={handleMechanismComplete}
                    />
                  </div>
                ) : !mastered && !mechanismSkipped ? (
                  <div className="w-full mb-8">
                    <MechanismCard
                      questionCount={allMechanismQuestions.length}
                      onStart={() => setShowMechanismRound(true)}
                      onSkip={() => setMechanismSkipped(true)}
                    />
                  </div>
                ) : mechanismSkipped && !mastered ? (
                  <div className="w-full mb-6 text-center">
                    <button
                      onClick={() => {
                        setMechanismSkipped(false);
                        setShowMechanismRound(true);
                      }}
                      className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors underline underline-offset-4"
                    >
                      ↑ Start Mechanism Round
                    </button>
                  </div>
                ) : null}
              </>
            )}

            {caseData?.sourceType === 'generated' && (
               <VotingPanel 
                   caseId={caseData._id} 
                   onVoteComplete={() => {
                        console.log("Voted");
                   }} 
               />
            )}

            <div className="mt-8 mb-4 text-center">
                <button 
                    onClick={() => {
                        if (mode === 'library') {
                            window.location.href = '/app/session?mode=practice';
                        } else {
                            loadNewCase(mode);
                        }
                    }}
                    className="inline-flex items-center px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-lg"
                >
                    <RefreshCw className="w-5 h-5 mr-3" />
                    Play Next Case
                </button>
                <div className="mt-6 text-slate-500 dark:text-slate-400 text-sm font-medium">
                     {status === 'solved' ? "Great diagnostic skills!" : "Better luck on the next consult."}
                </div>
            </div>
        </div>
      )}

    </div>
  );
}

