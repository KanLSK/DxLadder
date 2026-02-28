'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Search } from 'lucide-react';

export function TopAppBar() {
  const pathname = usePathname();

  // Basic breadcrumb generation based on path
  const getBreadcrumb = () => {
    if (pathname.includes('/dashboard')) return 'Dashboard';
    if (pathname.includes('/session')) return 'Active Session';
    if (pathname.includes('/library')) {
      if (pathname.split('/').length > 3) return 'Library \u203A Detail'; // basic check
      return 'Library';
    }
    if (pathname.includes('/studio')) return 'AI Studio';
    if (pathname.includes('/progress')) return 'Progress';
    if (pathname.includes('/settings')) return 'Settings';
    return 'Play';
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-[#18181B]/80 backdrop-blur-md border-b border-slate-200/60 dark:border-zinc-800/80 w-full flex items-center justify-between px-4 md:px-8">
      {/* Search / Breadcrumbs */}
      <div className="flex items-center gap-4 flex-1">
        <h1 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
          {getBreadcrumb()}
        </h1>
      </div>

      {/* Right Side Tools */}
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors hidden md:block">
          <Search className="w-4 h-4" />
        </button>
        <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        {/* Placeholder Avatar */}
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 flex items-center justify-center text-xs font-bold text-slate-500 cursor-pointer hover:opacity-80 transition-opacity">
          DS
        </div>
      </div>
    </header>
  );
}
