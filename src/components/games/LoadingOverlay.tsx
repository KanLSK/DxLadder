import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingOverlayProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  onCancel?: () => void;
  icon?: React.ReactNode;
}

export function LoadingOverlay({ 
  isOpen, 
  title, 
  subtitle, 
  onCancel,
  icon
}: LoadingOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-300" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center animate-in zoom-in-95 duration-300 max-w-sm text-center">
        {icon || <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-6" />}
        
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
          {title}
        </h2>
        
        {subtitle && (
          <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
            {subtitle}
          </p>
        )}

        {/* Pulse line */}
        <div className="w-48 h-1 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden mb-8">
          <div className="h-full bg-indigo-500 rounded-full w-1/3 animate-[pulse-line_1.5s_ease-in-out_infinite]" />
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="px-6 py-2.5 rounded-full text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 shadow-sm"
          >
            Cancel
          </button>
        )}
      </div>

      <style jsx global>{`
        @keyframes pulse-line {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
