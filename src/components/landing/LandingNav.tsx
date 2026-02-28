'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300",
      scrolled 
        ? "bg-white/80 dark:bg-[#09090B]/80 backdrop-blur-md border-b border-slate-200/60 dark:border-zinc-800/80 shadow-sm py-3" 
        : "bg-transparent py-5"
    )}>
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold tracking-tight text-xl text-slate-900 dark:text-white">DxLadder</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600 dark:text-slate-300">
            <Link href="#product" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Product</Link>
            <Link href="#games" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Games</Link>
            <Link href="#community" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Community</Link>
            <Link href="#pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Pricing</Link>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/auth/signin" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors px-3 py-2">
            Sign in
          </Link>
          <Link href="/app/session?mode=daily" className="text-sm px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_4px_14px_0_rgba(79,70,229,0.39)]">
            Start playing
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-slate-600 dark:text-slate-300"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-100 left-0 w-full bg-white dark:bg-[#09090B] border-b border-slate-200 dark:border-zinc-800 shadow-xl md:hidden px-6 py-4 flex flex-col gap-4">
            <Link href="#product" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-slate-900 dark:text-white">Product</Link>
            <Link href="#games" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-slate-900 dark:text-white">Games</Link>
            <Link href="#community" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-slate-900 dark:text-white">Community</Link>
            <Link href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-slate-900 dark:text-white">Pricing</Link>
            <hr className="border-slate-100 dark:border-zinc-800 my-2" />
            <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-slate-900 dark:text-white">Sign In</Link>
            <Link href="/app/session?mode=daily" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-indigo-600 dark:text-indigo-400">Start playing →</Link>
        </div>
      )}

      {/* Floating CTA (Visible only after scrolling) */}
      <div className={cn(
        "fixed bottom-6 right-6 z-50 transition-all duration-500 transform",
        scrolled ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
      )}>
        <Link 
          href="/app/session?mode=daily" 
          className="flex items-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/30 transition-transform hover:scale-105 active:scale-95"
        >
          <Activity className="w-5 h-5" />
          <span>Start Playing</span>
        </Link>
      </div>
    </nav>
  );
}
