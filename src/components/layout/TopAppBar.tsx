'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Bell, Search, LogOut, Settings, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export function TopAppBar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Basic breadcrumb generation based on path
  const getBreadcrumb = () => {
    if (pathname.includes('/dashboard')) return 'Dashboard';
    if (pathname.includes('/session')) return 'Active Session';
    if (pathname.includes('/library')) {
      if (pathname.split('/').length > 3) return 'Library › Detail';
      return 'Library';
    }
    if (pathname.includes('/studio')) return 'AI Studio';
    if (pathname.includes('/progress')) return 'Progress';
    if (pathname.includes('/settings')) return 'Settings';
    return 'Play';
  };

  const userInitials = session?.user?.displayName
    ? session.user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : session?.user?.name
      ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : '?';

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

        {/* User Avatar + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:bg-indigo-700 transition-colors">
              {userInitials}
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden md:block" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#18181B] rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              {/* User info */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {session?.user?.displayName || session?.user?.name || 'User'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {session?.user?.email}
                </div>
                {session?.user?.level && (
                  <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mt-1">
                    {session.user.level}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="py-1">
                <Link
                  href="/app/settings"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Settings
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
