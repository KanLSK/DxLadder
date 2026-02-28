'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Play, BookOpen, Brain, Settings, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SidebarNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'daily';

  const isPlayActive = pathname === '/play' || pathname === '/';
  const isLibraryActive = pathname === '/library';

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-transparent border-r border-black/5 dark:border-white/5 sticky top-0 shrink-0">
        <div className="px-6 pt-8 pb-4">
          <Link href="/" className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 transition-opacity hover:opacity-80">
            <Activity className="w-5 h-5 text-indigo-500" />
            DxLadder
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-6 mt-2 overflow-y-auto">
          {/* PRIMARY ACTION */}
          <div>
            <h2 className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
              Play
            </h2>
            <ul className="space-y-0.5">
              <li>
                <Link
                  href="/play?mode=daily"
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                    isPlayActive && mode === 'daily'
                      ? "bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white"
                      : "text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  <Play className={cn("w-4 h-4 mr-3", isPlayActive && mode === 'daily' ? "text-indigo-500" : "text-slate-400 group-hover:text-slate-500")} />
                  Daily Case
                </Link>
              </li>
              <li>
                <Link
                  href="/play?mode=practice"
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                    isPlayActive && mode === 'practice'
                      ? "bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white"
                      : "text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  <Activity className={cn("w-4 h-4 mr-3", isPlayActive && mode === 'practice' ? "text-indigo-500" : "text-slate-400 group-hover:text-slate-500")} />
                  Practice
                </Link>
              </li>
              <li>
                <Link
                  href="/play?mode=ai"
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                    isPlayActive && mode === 'ai'
                      ? "bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white"
                      : "text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  <Brain className={cn("w-4 h-4 mr-3", isPlayActive && mode === 'ai' ? "text-indigo-500" : "text-slate-400 group-hover:text-slate-500")} />
                  AI Review
                  {isPlayActive && mode === 'ai' && (
                      <span className="ml-auto bg-indigo-500 text-white py-0.5 px-2 rounded-full text-[9px] font-bold">Beta</span>
                  )}
                </Link>
              </li>
            </ul>
          </div>

          {/* SECONDARY ACTION */}
          <div>
            <h2 className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
              Discover
            </h2>
            <ul className="space-y-0.5">
              <li>
                <Link
                  href="/library"
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                    isLibraryActive
                      ? "bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white"
                      : "text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  <BookOpen className={cn("w-4 h-4 mr-3", isLibraryActive ? "text-indigo-500" : "text-slate-400 group-hover:text-slate-500")} />
                  Case Library
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* BOTTOM METADATA / SETTINGS */}
        <div className="p-3 mt-auto mb-4 mx-3">
           <button className="flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
              <Settings className="w-4 h-4 mr-3 opacity-70" />
              Settings
           </button>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-xl border-t border-black/5 dark:border-white/5 flex items-center justify-around z-50 safe-area-bottom">
        <Link 
          href="/play?mode=daily" 
          className={cn(
            "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
            isPlayActive && mode !== 'ai' ? "text-indigo-500 font-semibold" : "text-slate-400 dark:text-slate-500"
          )}
        >
          <Play className={cn("w-5 h-5", isPlayActive && mode !== 'ai' && "fill-current")} />
          <span className="text-[10px]">Play</span>
        </Link>
        <Link 
          href="/play?mode=ai" 
          className={cn(
            "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
            isPlayActive && mode === 'ai' ? "text-indigo-500 font-semibold" : "text-slate-400 dark:text-slate-500"
          )}
        >
          <Brain className={cn("w-5 h-5", isPlayActive && mode === 'ai' && "fill-current")} />
          <span className="text-[10px]">AI</span>
        </Link>
        <Link 
          href="/library" 
          className={cn(
            "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
            isLibraryActive ? "text-indigo-500 font-semibold" : "text-slate-400 dark:text-slate-500"
          )}
        >
          <BookOpen className={cn("w-5 h-5", isLibraryActive && "fill-current")} />
          <span className="text-[10px]">Library</span>
        </Link>
      </nav>
    </>
  );
}
