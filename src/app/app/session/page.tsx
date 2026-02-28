'use client';

import { Suspense } from 'react';
import { PlayPage } from '@/components/PlayPage';

function SessionContent() {
  return <PlayPage />;
}

export default function SessionPage() {
  return (
    <div className="w-full h-full pb-32">
      <Suspense fallback={
        <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500 font-medium text-sm">Loading session…</span>
        </div>
      }>
        <SessionContent />
      </Suspense>
    </div>
  );
}
