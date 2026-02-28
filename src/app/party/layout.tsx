import React from 'react';
import Link from 'next/link';
import { Activity, ArrowLeft } from 'lucide-react';

export default function PartyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#09090B]">
      {/* Minimal header */}
      <header className="h-14 border-b border-slate-200 dark:border-zinc-800/80 flex items-center px-4 sm:px-6 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <Link href="/app/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mr-4">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </Link>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-600" />
          <span className="font-bold text-slate-900 dark:text-white tracking-tight">DxLadder</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">PARTY</span>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
