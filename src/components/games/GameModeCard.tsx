import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameModeCardProps {
  title: string;
  tagline: string;
  icon: React.ReactNode;
  pills: string[];
  ctaText: string;
  href: string;
  onSecondaryClick?: () => void;
  gradientClass: string;
}

export function GameModeCard({
  title,
  tagline,
  icon,
  pills,
  ctaText,
  href,
  onSecondaryClick,
  gradientClass,
}: GameModeCardProps) {
  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900',
        'transition-all duration-250 ease-out hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-indigo-500/10 hover:border-indigo-300 dark:hover:border-indigo-500/50',
        'min-h-[240px] p-6'
      )}
    >
      {/* Background Subtle Gradient Top-Right */}
      <div
        className={cn(
          'absolute -right-20 -top-20 h-40 w-40 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-300',
          gradientClass
        )}
      />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700/50 shadow-sm text-indigo-500">
            {icon}
          </div>
        </div>

        {/* Text */}
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1">
          {title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 font-medium">
          {tagline}
        </p>

        {/* Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {pills.map((pill) => (
            <span
              key={pill}
              className="px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300"
            >
              {pill}
            </span>
          ))}
        </div>

        {/* Footer CTAs */}
        <div className="mt-auto flex items-center justify-between">
          <Link
            href={href}
            className="flex items-center justify-center py-2.5 px-5 rounded-xl text-sm font-bold text-white bg-slate-900 dark:bg-white dark:text-zinc-900 hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors shadow-sm group-hover:shadow-md"
          >
            {ctaText}
          </Link>

          {onSecondaryClick && (
            <button
              onClick={onSecondaryClick}
              className="text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors flex items-center"
            >
              Learn more <ChevronRight className="w-3 h-3 ml-0.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
