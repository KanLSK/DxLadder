'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const FAQS = [
  {
    question: "Is this medical advice?",
    answer: "Absolutely not. DxLadder is a simulated clinical reasoning application designed strictly for educational and entertainment purposes. It should never be used to guide real clinical decision-making or self-diagnosis."
  },
  {
    question: "How are the cases generated and reviewed?",
    answer: "Our 'AI Studio' allows users to generate cases using a customized large language model prompted to create realistic, medically sound scenarios. These cases undergo community peer review (upvotes/downvotes). Cases that perform well and are medically accurate get added to the official DxLadder library by our moderation team."
  },
  {
    question: "Are ranked games truly anonymous?",
    answer: "Yes. In Dx Duel (ranked matchmaking), you climb the ladder using an anonymous alias. Your rank and Elo rating are public, but your real identity remains hidden to protect the learning environment."
  },
  {
    question: "What is the difference between Vignette and APK style?",
    answer: "Vignette style delivers information in short, rapid-fire bullet points, mimicking a USMLE board question. APK (Abstracted Patient Knowledge) style resembles a real patient chart with distinct sections like HPI, Vitals, Exam, and Labs, requiring you to sift through more data to find what matters."
  },
  {
    question: "Can I play privately with my study group?",
    answer: "Yes! In the 'Private Arena' mode, you can create a secure lobby code and invite your friends. You can play 1v1, 2v2, or 4v4 duels, or try novel games like Chaos Mode and Clue Auction together."
  }
];

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-slate-50 dark:bg-[#09090B] border-t border-slate-100 dark:border-zinc-800/80 px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-12 text-center">
          Frequently asked questions.
        </h2>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx}
                className={cn(
                  "border rounded-2xl transition-all duration-300 overflow-hidden",
                  isOpen 
                    ? "bg-white dark:bg-zinc-900 border-indigo-200 dark:border-indigo-500/30 shadow-sm" 
                    : "bg-transparent border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-white/50 dark:hover:bg-zinc-900/50"
                )}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <span className={cn(
                    "font-bold text-lg pr-8",
                    isOpen ? "text-indigo-600 dark:text-indigo-400" : "text-slate-900 dark:text-white"
                  )}>
                    {faq.question}
                  </span>
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border transition-all shrink-0",
                    isOpen 
                      ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400" 
                      : "bg-transparent border-slate-200 dark:border-zinc-700 text-slate-400"
                  )}>
                    <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", isOpen && "rotate-180")} />
                  </div>
                </button>
                
                <div 
                  className={cn(
                    "transition-all duration-300 ease-in-out px-6 text-slate-600 dark:text-slate-400 font-medium leading-relaxed",
                    isOpen ? "max-h-96 opacity-100 pb-6" : "max-h-0 opacity-0 pb-0"
                  )}
                >
                  {faq.answer}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
