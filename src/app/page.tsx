import React from 'react';
import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';
import { LandingNav } from '@/components/landing/LandingNav';
import { HeroMiniCaseDemo } from '@/components/landing/HeroMiniCaseDemo';
import { StatsStripCountUp } from '@/components/landing/StatsStripCountUp';
import { ProductTabs } from '@/components/landing/ProductTabs';
import { GamesModeSelector } from '@/components/landing/GamesModeSelector';
import { CommunityFeedPreview } from '@/components/landing/CommunityFeedPreview';
import { StyleTogglePreview } from '@/components/landing/StyleTogglePreview';
import { PricingSection } from '@/components/landing/PricingSection';
import { FAQAccordion } from '@/components/landing/FAQAccordion';
import { FooterDisclaimer } from '@/components/landing/FooterDisclaimer';

export const metadata = {
  title: 'DxLadder | Clinical Reasoning & Medical Diagnosis Games',
  description: 'Practice progressive disclosure diagnosis, play 1v1 clinical duels, and master every medical specialty.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#09090B] text-slate-900 dark:text-slate-50 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      
      <LandingNav />

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
         {/* Soft gradient background blob */}
         <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-indigo-50 dark:from-indigo-900/10 to-transparent pointer-events-none" />

         <div className="max-w-6xl mx-auto relative z-10 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
             
             {/* Left Text */}
             <div className="flex flex-col items-start text-left">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
                     <Play className="w-3 h-3 fill-current" />
                     DxLadder 2.0 is live
                 </div>
                 
                 <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] text-slate-900 dark:text-white">
                     Climb your clinical reasoning—<br className="hidden lg:block"/>one clue at a time.
                 </h1>
                 
                 <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed font-medium max-w-lg">
                     Guess the diagnosis from limited data. Unlock more only when you're wrong. Progress from 'Solved' to 'Mastered'.
                 </p>

                 <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                     <Link 
                        href="/app/session?mode=daily"
                        className="w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-[0_8px_20px_-8px_rgba(79,70,229,0.5)] active:scale-95 text-lg"
                     >
                        Start a Session <ArrowRight className="w-5 h-5 ml-2" />
                     </Link>
                     <Link 
                        href="#games"
                        className="w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-900 dark:text-white font-bold rounded-xl transition-colors text-lg"
                     >
                        Explore Games
                     </Link>
                 </div>
             </div>

             {/* Right Interactive Demo */}
             <div className="relative w-full">
                 <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-3xl rounded-[3rem] -z-10" />
                 <HeroMiniCaseDemo />
             </div>
             
         </div>
      </section>

      {/* 2. SOCIAL PROOF STRIP */}
      <StatsStripCountUp />

      {/* 3. PRODUCT OVERVIEW TABS */}
      <ProductTabs />

      {/* 4. GAMES MODE SELECTOR */}
      <GamesModeSelector />

      {/* 5. COMMUNITY FEED PREVIEW */}
      <CommunityFeedPreview />

      {/* 6. STYLE TOGGLE (APK vs Vignette) */}
      <StyleTogglePreview />

      {/* 7. PRICING */}
      <PricingSection />

      {/* 8. FAQ */}
      <FAQAccordion />

      {/* 9. FINAL CTA */}
      <section className="py-32 bg-indigo-600 text-center px-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="max-w-3xl mx-auto relative z-10 flex flex-col items-center">
              <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
                  Stop reading. Start reasoning.
              </h2>
              <p className="text-xl text-indigo-100 mb-10 font-medium max-w-2xl mx-auto">
                  Join the clinical playground designed to reward your thinking. Whether you're flying solo in a daily session or battling friends in Chaos Mode, your intuition starts improving today.
              </p>
              <Link 
                  href="/app/session?mode=daily"
                  className="inline-flex items-center justify-center px-10 py-5 bg-white hover:bg-slate-50 text-indigo-900 font-extrabold rounded-2xl transition-all shadow-2xl active:scale-95 text-xl group"
              >
                  Play now for free
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </Link>
          </div>
      </section>

      {/* 10. FOOTER */}
      <FooterDisclaimer />

    </div>
  );
}

