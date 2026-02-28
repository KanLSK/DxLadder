'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { LayoutDashboard, PlayCircle, BookOpen, BrainCircuit, LineChart, Settings, Activity, Users, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SaaSNavigation() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Session', href: '/app/session', icon: PlayCircle },
    { name: 'Library', href: '/app/library', icon: BookOpen },
    { name: 'AI Studio', href: '/app/studio', icon: BrainCircuit },
    { name: 'Community', href: '/app/community', icon: Users },
    { name: 'Games', href: '/app/games', icon: Swords },
    { name: 'Progress', href: '/app/progress', icon: LineChart },
  ];

  const userInitials = session?.user?.displayName
    ? session.user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : session?.user?.name
      ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : '?';

  return (
    <>
      {/* Desktop Left Rail */}
      <aside className="hidden md:flex flex-col w-20 xl:w-64 h-screen bg-[#F9FAFB] dark:bg-[#09090B] border-r border-slate-200 dark:border-zinc-800/80 sticky top-0 shrink-0 z-40 transition-all duration-300">
        <div className="h-16 flex items-center justify-center xl:justify-start xl:px-6">
          <Link href="/" className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Activity className="w-6 h-6 xl:w-5 xl:h-5 text-indigo-600 dark:text-indigo-500 shrink-0" />
            <span className="hidden xl:inline">DxLadder</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.name}
                className={cn(
                  "flex items-center justify-center xl:justify-start p-3 xl:px-3 xl:py-2 rounded-lg text-sm font-medium transition-all group",
                  isActive
                    ? "bg-white dark:bg-[#18181B] text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-zinc-800/60"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-900/50 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent"
                )}
              >
                <item.icon className={cn("w-5 h-5 xl:w-4 xl:h-4 xl:mr-3 shrink-0", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300")} />
                <span className="hidden xl:inline">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Global Nav Bottom */}
        <div className="p-3 mt-auto mb-4 mx-2 xl:mx-3 space-y-2">
           {/* User card */}
           {session?.user && (
             <div className="flex items-center justify-center xl:justify-start gap-3 p-2 xl:px-3 xl:py-2.5 rounded-lg bg-slate-100/60 dark:bg-zinc-900/50 mb-2 overflow-hidden" title={session.user.name || ''}>
               <div className="w-8 h-8 xl:w-7 xl:h-7 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] xl:text-[10px] font-bold text-white shrink-0">
                 {userInitials}
               </div>
               <div className="hidden xl:block min-w-0 flex-1">
                 <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                   {session.user.displayName || session.user.name}
                 </div>
                 <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                   {session.user.email}
                 </div>
               </div>
             </div>
           )}
           <Link href="/app/settings" title="Settings" className={cn(
               "flex items-center justify-center xl:justify-start p-3 xl:px-3 xl:py-2 rounded-lg text-sm font-medium transition-colors",
               pathname.startsWith('/app/settings') 
                   ? "bg-slate-200/50 dark:bg-zinc-800/50 text-slate-900 dark:text-white" 
                   : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-900/50 hover:text-slate-900 dark:hover:text-slate-200"
           )}>
              <Settings className="w-5 h-5 xl:w-4 xl:h-4 xl:mr-3 opacity-70 shrink-0" />
              <span className="hidden xl:inline">Settings</span>
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
