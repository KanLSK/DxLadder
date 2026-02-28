import React from 'react';
import { useRouter } from 'next/navigation';
import { Settings2, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameShellProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode; // e.g. Timer or "Generating..."
  onLeave?: () => void;
  onSettings?: () => void;
  children: React.ReactNode;
  bottomAction?: React.ReactNode;
  rightRail?: React.ReactNode;
}

export function GameShell({
  icon,
  title,
  subtitle,
  onLeave,
  onSettings,
  children,
  bottomAction,
  rightRail
}: GameShellProps) {
  const router = useRouter();

  const handleLeave = () => {
    if (onLeave) onLeave();
    else router.push('/app/games');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-[calc(100vh-120px)] animate-in fade-in duration-300 w-full max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3 mb-4 shadow-sm shrink-0">
        
        {/* Left: Icon + Title */}
        <div className="flex items-center gap-3 w-1/3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
            {icon}
          </div>
          <h1 className="font-extrabold text-slate-900 dark:text-white truncate">
            {title}
          </h1>
        </div>

        {/* Center: Subtitle / Timer */}
        <div className="flex-1 flex justify-center text-center px-4">
          {subtitle && (
            <div className="text-sm font-bold text-slate-500 dark:text-slate-400">
              {subtitle}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end gap-2 w-1/3">
          {onSettings && (
            <button 
              onClick={onSettings}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
              title="Settings"
            >
              <Settings2 className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={handleLeave}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-rose-500 hover:text-white hover:bg-rose-500 transition-colors rounded-lg border border-rose-200 dark:border-rose-900/50 hover:border-transparent"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 mb-4">
        {/* Center Primary (Case Panel) */}
        <div className="flex-1 min-w-0 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden flex flex-col shadow-sm">
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {children}
          </div>
        </div>

        {/* Right Rail (Player List / Scoreboard) */}
        {rightRail && (
          <div className="lg:w-80 shrink-0 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
            {rightRail}
          </div>
        )}
      </div>

      {/* Bottom Action Dock */}
      {bottomAction && (
        <div className="shrink-0 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-lg sticky bottom-4 md:bottom-0 w-full mb-4">
          {bottomAction}
        </div>
      )}
    </div>
  );
}
