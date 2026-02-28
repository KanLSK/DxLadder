'use client';

import React from 'react';
import Link from 'next/link';
import { Activity } from 'lucide-react';

export function FooterDisclaimer() {
  return (
    <footer className="bg-white dark:bg-[#09090B] border-t border-slate-100 dark:border-zinc-800/80 pt-16 pb-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
        
        <Link href="/" className="flex items-center gap-2 mb-8 opacity-50 hover:opacity-100 transition-opacity">
          <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-500" />
          <span className="font-extrabold tracking-tight text-xl text-slate-900 dark:text-white">DxLadder</span>
        </Link>
        
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-xl p-6 max-w-2xl mb-12">
            <h4 className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-2">
                Medical Disclaimer
            </h4>
            <p className="text-sm text-rose-800/80 dark:text-rose-200/70 font-medium leading-relaxed">
                DxLadder is a simulated application designed strictly for educational and entertainment purposes. 
                The cases, diagnoses, and treatments presented are entirely fictional or generalized and 
                <strong className="mx-1">must not</strong> be used as a substitute for professional medical advice, 
                diagnosis, or treatment. Always seek the advice of a qualified healthcare provider with any 
                questions you may have regarding a medical condition.
            </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-sm font-bold text-slate-500 dark:text-slate-400 w-full border-t border-slate-100 dark:border-zinc-800/80 pt-8">
            <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Contact Us</Link>
            <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">X / Twitter</Link>
        </div>

        <div className="mt-8 text-xs font-semibold text-slate-400 dark:text-slate-500">
            &copy; {new Date().getFullYear()} DxLadder. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
