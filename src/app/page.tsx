import React from 'react';
import Link from 'next/link';
import { Activity, Play, Stethoscope, Search, BookOpen, ShieldCheck, CheckCircle2, Trophy, BrainCircuit, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#09090B] text-slate-900 dark:text-slate-50 font-sans selection:bg-indigo-500/30">
      
      {/* 0. MARKETING NAV */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#09090B]/80 backdrop-blur-md border-b border-slate-200/60 dark:border-zinc-800/80">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-8">
                  <Link href="/" className="flex items-center gap-2 group">
                      <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-500 group-hover:scale-110 transition-transform" />
                      <span className="font-bold tracking-tight text-lg">DxLadder</span>
                  </Link>
                  <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
                      <Link href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">Features</Link>
                      <Link href="#library" className="hover:text-slate-900 dark:hover:text-white transition-colors">Library</Link>
                      <Link href="#pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</Link>
                  </div>
              </div>
              <div className="flex items-center gap-4">
                  <Link href="/app/dashboard" className="hidden sm:block text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                      Sign In
                  </Link>
                  <Link href="/app/dashboard" className="text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all active:scale-95 shadow-sm">
                      Start Free Session
                  </Link>
              </div>
          </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden px-6">
         {/* Soft gradient background blob */}
         <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-indigo-50/50 dark:from-indigo-900/10 to-transparent pointer-events-none" />

         <div className="max-w-6xl mx-auto relative z-10 grid md:grid-cols-2 gap-12 items-center">
             
             {/* Left Text */}
             <div className="flex flex-col items-start text-left">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
                     <Play className="w-3 h-3 fill-current" />
                     DxLadder 2.0 is live
                 </div>
                 
                 <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] text-slate-900 dark:text-white">
                     Clinical reasoning practice —<br className="hidden lg:block"/> in 5 minutes a day.
                 </h1>
                 
                 <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-lg font-medium">
                     Solve stepwise vignettes. Build diagnostic intuition. Track your improvement by organ system. 
                     The daily habit for medical students and residents.
                 </p>

                 <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                     <Link 
                        href="/app/session?mode=daily"
                        className="w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-[0_8px_20px_-8px_rgba(79,70,229,0.5)] active:scale-95 text-lg"
                     >
                        Start your first case <ArrowRight className="w-5 h-5 ml-2" />
                     </Link>
                     <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 sm:mt-0 sm:ml-2">
                        No credit card required.
                     </p>
                 </div>
             </div>

             {/* Right App Preview Abstract */}
             <div className="relative w-full aspect-square md:aspect-[4/3] rounded-2xl bg-slate-50 dark:bg-[#18181B] border border-slate-200/60 dark:border-zinc-800/60 shadow-2xl shadow-indigo-500/5 p-6 flex flex-col justify-between overflow-hidden">
                 {/* Fake App UI */}
                 <div className="flex items-center justify-between mb-8 opacity-50">
                     <div className="h-4 w-24 bg-slate-300 dark:bg-zinc-700 rounded-full" />
                     <div className="h-4 w-8 bg-slate-300 dark:bg-zinc-700 rounded-full" />
                 </div>
                 
                 <div className="space-y-4 mb-auto z-10">
                     <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-xl shadow-sm">
                         <div className="h-3 w-16 bg-slate-200 dark:bg-zinc-700 rounded-full mb-3" />
                         <div className="h-4 w-full bg-slate-800 dark:bg-slate-200 rounded-full mb-2" />
                         <div className="h-4 w-4/5 bg-slate-800 dark:bg-slate-200 rounded-full" />
                     </div>
                     <div className="p-4 bg-white/50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800 rounded-xl blur-[1px] opacity-70">
                         <div className="h-3 w-16 bg-slate-200 dark:bg-zinc-700 rounded-full mb-3" />
                         <div className="h-4 w-3/4 bg-slate-400 dark:bg-zinc-600 rounded-full mb-2" />
                     </div>
                 </div>

                 {/* Fake Input */}
                 <div className="relative z-10 mt-8 p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-lg flex items-center justify-between">
                     <span className="text-slate-400 text-sm font-medium ml-2">Enter diagnosis...</span>
                     <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                         <ArrowRight className="w-4 h-4 text-white" />
                     </div>
                 </div>

                 {/* Decorative background gradients inside the mock */}
                 <div className="absolute right-0 bottom-0 w-64 h-64 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />
             </div>
             
         </div>
      </section>

      {/* 2. SOCIAL PROOF */}
      <section className="py-12 border-y border-slate-100 dark:border-zinc-800/80 bg-slate-50 dark:bg-[#09090B]">
          <div className="max-w-6xl mx-auto px-6 text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-8">
                  Trusted by medical trainees worldwide
              </p>
              <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale select-none">
                  {/* Fake logos using text for now */}
                  <span className="text-xl font-extrabold flex items-center gap-2"><div className="w-4 h-4 rounded-sm bg-current"></div> ACADEMY MED</span>
                  <span className="text-xl font-extrabold flex items-center gap-2"><div className="w-4 h-4 rounded-full border-[3px] border-current"></div> CLINICAL.IO</span>
                  <span className="text-xl font-extrabold flex items-center gap-2">H<span className="tracking-tighter">OSP</span>ITAL</span>
                  <span className="text-xl font-extrabold flex items-center gap-2"><Activity className="w-6 h-6" /> WARDS TECH</span>
              </div>
          </div>
      </section>

      {/* 3. FEATURE SECTIONS (Z-Pattern) */}
      <section id="features" className="py-24 md:py-32 overflow-hidden px-6">
          <div className="max-w-6xl mx-auto space-y-32">
              
              {/* Feature 1 */}
              <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-center">
                  <div className="order-2 md:order-1">
                      <div className="w-full aspect-square rounded-2xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center border border-slate-200 dark:border-zinc-800">
                          <Search className="w-24 h-24 text-slate-300 dark:text-zinc-700" />
                      </div>
                  </div>
                  <div className="order-1 md:order-2 flex flex-col items-start text-left">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-4">
                          Progressive Disclosure
                      </h3>
                      <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
                          Reveal the clinical picture as needed.
                      </h2>
                      <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                          Real medicine doesn't hand you all the answers at once. Start with the presentation. Submit a diagnosis. If it's incorrect, unlock the vitals, then the exam, then the labs. Learn efficiently.
                      </p>
                  </div>
              </div>

              {/* Feature 2 */}
              <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-center">
                  <div className="flex flex-col items-start text-left">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-4">
                          System Mastery
                      </h3>
                      <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
                          Organize your brain by organ system.
                      </h2>
                      <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                          Stop reviewing randomly. Dive into the Cardiovascular bucket, do a 3-case sprint on Neurology, or conquer your weak spots in Renal. Our dedicated library keeps you focused.
                      </p>
                  </div>
                  <div className="w-full aspect-square rounded-2xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center border border-slate-200 dark:border-zinc-800">
                      <BookOpen className="w-24 h-24 text-slate-300 dark:text-zinc-700" />
                  </div>
              </div>

              {/* Feature 3 */}
              <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-center">
                  <div className="order-2 md:order-1">
                      <div className="w-full aspect-square rounded-2xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center border border-slate-200 dark:border-zinc-800">
                          <BrainCircuit className="w-24 h-24 text-slate-300 dark:text-zinc-700" />
                      </div>
                  </div>
                  <div className="order-1 md:order-2 flex flex-col items-start text-left">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500 mb-4">
                          AI Studio
                      </h3>
                      <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
                          Community-approved AI cases.
                      </h2>
                      <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                          Generate unlimited cases with our fine-tuned AI. Review them for realism alongside the community. The best cases get permanently promoted to the official DxLadder library.
                      </p>
                  </div>
              </div>

          </div>
      </section>

      {/* 4. PRICING SUMMARY */}
      <section id="pricing" className="py-24 bg-slate-50 dark:bg-[#09090B] border-t border-slate-200 dark:border-zinc-800/80 px-6">
          <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
                      Simple pricing for focused learning.
                  </h2>
                  <p className="text-lg font-medium text-slate-500 dark:text-slate-400">
                      Start building your clinical intuition today.
                  </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                  {/* Free Tier */}
                  <div className="bg-white dark:bg-[#18181B] rounded-2xl p-8 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Basic</h3>
                      <div className="flex items-baseline gap-2 mb-6">
                          <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$0</span>
                          <span className="text-slate-500 font-medium">/forever</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 font-medium mb-8">
                          Perfect for students building a daily study habit.
                      </p>
                      <ul className="space-y-4 mb-8 flex-1">
                          <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                              <CheckCircle2 className="w-5 h-5 text-indigo-500" /> 1 Daily Case
                          </li>
                          <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                              <CheckCircle2 className="w-5 h-5 text-indigo-500" /> Basic Library Access
                          </li>
                          <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                              <CheckCircle2 className="w-5 h-5 text-indigo-500" /> Community Voting
                          </li>
                      </ul>
                      <Link href="/app/dashboard" className="w-full py-4 text-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-900 dark:text-white font-bold transition-colors">
                          Get Started
                      </Link>
                  </div>

                  {/* Pro Tier */}
                  <div className="bg-indigo-600 rounded-2xl p-8 border border-indigo-500 shadow-xl shadow-indigo-500/10 flex flex-col relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-xl">
                          Coming Soon
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">DxLadder Pro</h3>
                      <div className="flex items-baseline gap-2 mb-6 text-white">
                          <span className="text-4xl font-extrabold">$8</span>
                          <span className="text-indigo-200 font-medium">/month</span>
                      </div>
                      <p className="text-indigo-100 font-medium mb-8">
                          Advanced clinical tools for residents and intense exam prep.
                      </p>
                      <ul className="space-y-4 mb-8 flex-1">
                          <li className="flex items-center gap-3 text-white font-medium">
                              <CheckCircle2 className="w-5 h-5 text-indigo-300" /> Unlimited System Sprints
                          </li>
                          <li className="flex items-center gap-3 text-white font-medium">
                              <CheckCircle2 className="w-5 h-5 text-indigo-300" /> Full Progress Analytics
                          </li>
                          <li className="flex items-center gap-3 text-white font-medium">
                              <CheckCircle2 className="w-5 h-5 text-indigo-300" /> Priority AI Studio Access
                          </li>
                      </ul>
                      <button disabled className="w-full py-4 text-center rounded-xl bg-white/10 text-white font-bold opacity-70 cursor-not-allowed">
                          Join Waitlist
                      </button>
                  </div>
              </div>
          </div>
      </section>

      {/* 5. FINAL CTA & FOOTER */}
      <section className="py-24 border-t border-slate-200 dark:border-zinc-800/80 px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
              Sharpen your intuition.
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 max-w-lg mx-auto font-medium">
              Join the clinical reasoning playground designed to reward your thinking.
          </p>
          <Link 
              href="/app/session?mode=daily"
              className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl transition-all shadow-lg active:scale-95 text-lg"
          >
              Start Free Session
          </Link>
          
          <footer className="mt-32 pt-8 border-t border-slate-100 dark:border-zinc-800/50 text-slate-400 text-sm flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto">
              <div>&copy; {new Date().getFullYear()} DxLadder. All rights reserved.</div>
              <div className="flex items-center gap-6 mt-4 md:mt-0">
                  <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</a>
                  <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</a>
                  <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Twitter</a>
              </div>
          </footer>
      </section>

    </div>
  );
}
