'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ClinicalChart } from './session/ClinicalChart';
import { ThinkSpace } from './session/ThinkSpace';
import { VotingPanel } from './VotingPanel';
import { RefreshCw } from 'lucide-react';

export function PlayPage() {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get('mode') || 'daily';
  
  const [mode, setMode] = useState<'daily' | 'practice' | 'ai' | 'library'>(modeParam as any);
  
  const [caseData, setCaseData] = useState<any>(null);
  const [currentLayerIndex, setCurrentLayerIndex] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [status, setStatus] = useState<'playing' | 'solved' | 'failed'>('playing');
  const [reveal, setReveal] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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
    if (!caseData || status !== 'playing') return;
    setHistory(prev => [...prev, guess]);

    try {
      const uid = localStorage.getItem('dxladder_uid');
      
      const res = await fetch('/api/play/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: caseData._id,
          guess: guess,
          currentLayerIndex: currentLayerIndex,
          userKey: uid || 'anonymous',
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

        // Only set reveal data when the game is finished
        if (result.finished && result.reveal) {
          setReveal(result.reveal);
        }
      }

    } catch (e) {
      console.error('Error submitting guess:', e);
    }
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
        />
      ) : (
        <div className="mt-12 w-full max-w-xl mx-auto flex flex-col items-center pb-24">
            
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
