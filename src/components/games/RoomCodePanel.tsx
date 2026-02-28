import React, { useState } from 'react';
import { Copy, Check, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoomCodePanelProps {
  roomKey: string;
  playersCount: number;
  maxPlayers: number;
}

export function RoomCodePanel({ roomKey, playersCount, maxPlayers }: RoomCodePanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-zinc-800/30 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <Users className="w-4 h-4 text-indigo-500" />
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Waiting for players ({playersCount}/{maxPlayers})
        </span>
      </div>
      
      <div className="text-sm text-slate-500 dark:text-slate-400 mb-6 text-center leading-relaxed">
        Share this code with your friends so they can join your arena.
      </div>

      <button
        onClick={handleCopy}
        className={cn(
          "relative group flex flex-col items-center gap-2 px-10 py-5 w-full bg-white dark:bg-zinc-900",
          "border-2 border-dashed rounded-2xl transition-all duration-200",
          copied 
            ? "border-emerald-500" 
            : "border-indigo-300 dark:border-indigo-500/50 hover:border-indigo-500 hover:shadow-lg dark:hover:shadow-indigo-500/10"
        )}
      >
        <span className="font-mono text-4xl font-black tracking-[0.4em] text-slate-900 dark:text-white uppercase relative z-10">
          {roomKey}
        </span>

        {copied ? (
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 mt-2">
            <Check className="w-4 h-4" /> Copied!
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity mt-2">
            <Copy className="w-4 h-4" /> Click to copy
          </div>
        )}
      </button>
    </div>
  );
}
