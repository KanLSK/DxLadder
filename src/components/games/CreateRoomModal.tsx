import React from 'react';
import { X, Settings2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RoomSettings {
  teamSize: 1 | 2 | 4;
  difficulty: number;
  style: string;
  mode: 'duel' | 'economy' | 'chaos';
  sabotage: 'off' | 'light' | 'normal';
}

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  settings: RoomSettings;
  onChange: (settings: RoomSettings) => void;
  onConfirm: () => void;
  fixedMode?: 'duel' | 'economy' | 'chaos';
  fixedSabotage?: 'off' | 'light' | 'normal';
  confirmText?: string;
  isCreating?: boolean;
}

export function CreateRoomModal({ 
  isOpen, 
  onClose, 
  title,
  settings,
  onChange,
  onConfirm,
  fixedMode,
  fixedSabotage,
  confirmText = "Create Room",
  isCreating = false
}: CreateRoomModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-800/30">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-full hover:bg-slate-200 dark:hover:bg-zinc-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Team Size */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block flex items-center gap-1.5">
              <Users className="w-3 h-3" /> Team Size
            </label>
            <div className="flex gap-2">
              {([1, 2, 4] as const).map(size => (
                <button
                  key={size}
                  onClick={() => onChange({ ...settings, teamSize: size })}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border',
                    settings.teamSize === size
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-300 dark:border-indigo-500/50 text-indigo-700 dark:text-indigo-400 shadow-sm'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-400 hover:border-indigo-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                  )}
                >
                  {size}v{size}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">
              Difficulty
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(d => (
                <button
                  key={d}
                  onClick={() => onChange({ ...settings, difficulty: d })}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border',
                    settings.difficulty === d
                      ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/50 text-amber-700 dark:text-amber-400 shadow-sm'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-400 hover:border-amber-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            {/* Mode */}
            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                Mode
              </label>
              {fixedMode ? (
                <div className="px-3 py-2.5 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 capitalize cursor-not-allowed">
                  {fixedMode}
                </div>
              ) : (
                <select
                  value={settings.mode}
                  onChange={(e) => onChange({ ...settings, mode: e.target.value as any })}
                  className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="duel">Duel</option>
                  <option value="economy">Economy</option>
                  <option value="chaos">Chaos</option>
                </select>
              )}
            </div>

            {/* Style */}
            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                Style
              </label>
              <select
                value={settings.style}
                onChange={(e) => onChange({ ...settings, style: e.target.value })}
                className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="vignette">Vignette</option>
                <option value="apk">APK</option>
              </select>
            </div>
          </div>

          {/* Sabotage */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">
              Sabotage Level
            </label>
            {fixedSabotage ? (
              <div className="px-3 py-2.5 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 capitalize cursor-not-allowed">
                {fixedSabotage}
              </div>
            ) : (
              <div className="flex gap-2">
                {(['off', 'light', 'normal'] as const).map(level => (
                  <button
                    key={level}
                    onClick={() => onChange({ ...settings, sabotage: level })}
                    className={cn(
                      'flex-1 py-2.5 rounded-xl text-sm font-bold capitalize transition-all border',
                      settings.sabotage === level
                        ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/50 text-rose-700 dark:text-rose-400 shadow-sm'
                        : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-400 hover:border-rose-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30">
          <button 
            onClick={onConfirm}
            disabled={isCreating}
            className="w-full py-3.5 px-4 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center"
          >
            {isCreating ? 'Creating Room...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
