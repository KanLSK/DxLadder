'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlayCircle, BookOpen, BrainCircuit, LineChart, Settings, Activity, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SaaSNavigation() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Session', href: '/app/session', icon: PlayCircle },
    { name: 'Library', href: '/app/library', icon: BookOpen },
    { name: 'AI Studio', href: '/app/studio', icon: BrainCircuit },
    { name: 'Community', href: '/app/community', icon: Users },
    { name: 'Progress', href: '/app/progress', icon: LineChart },
  ];

  return (
    <>
      {/* Desktop Left Rail */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-[#F9FAFB] dark:bg-[#09090B] border-r border-slate-200 dark:border-zinc-800/80 sticky top-0 shrink-0 z-40">
        <div className="h-16 flex items-center px-6">
          <Link href="/" className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-500" />
            DxLadder
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                  isActive
                    ? "bg-white dark:bg-[#18181B] text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-zinc-800/60"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-900/50 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent"
                )}
              >
                <item.icon className={cn("w-4 h-4 mr-3", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300")} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Global Nav Bottom */}
        <div className="p-3 mt-auto mb-4 mx-3">
           <Link href="/app/settings" className={cn(
               "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
               pathname.startsWith('/app/settings') 
                   ? "bg-slate-200/50 dark:bg-zinc-800/50 text-slate-900 dark:text-white" 
                   : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-900/50 hover:text-slate-900 dark:hover:text-slate-200"
           )}>
              <Settings className="w-4 h-4 mr-3 opacity-70" />
              Settings
           </Link>
        </div>
      </aside>

      {/* Mobile Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-t border-slate-200 dark:border-zinc-800/80 flex items-center justify-around z-50 pt-3 pb-safe px-2 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
        {navItems.slice(0, 4).map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={cn(
                "flex flex-col items-center justify-center w-full space-y-1 pb-2 transition-colors",
                isActive ? "text-indigo-600 dark:text-indigo-400 font-semibold" : "text-slate-500 dark:text-slate-400"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "fill-current/10")} />
              <span className="text-[10px]">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </>
  );
}
