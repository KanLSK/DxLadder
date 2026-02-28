'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Users, Library, Swords } from 'lucide-react';

interface StatItemProps {
  end: number;
  label: string;
  prefix?: string;
  suffix?: string;
  icon: React.ReactNode;
}

function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const countRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (countRef.current) observer.observe(countRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    let startTimestamp: number;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration, isVisible]);

  return { count, countRef };
}

function StatItem({ end, label, prefix = '', suffix = '', icon }: StatItemProps) {
  const { count, countRef } = useCountUp(end);

  return (
    <div ref={countRef} className="flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
        {icon}
      </div>
      <div className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
        {label}
      </div>
    </div>
  );
}

export function StatsStripCountUp() {
  return (
    <section className="py-16 md:py-24 border-y border-slate-100 dark:border-zinc-800/80 bg-white dark:bg-[#09090B]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x-0 md:divide-x divide-slate-100 dark:divide-zinc-800">
          <StatItem 
            end={25000} 
            suffix="+" 
            label="Cases Mastered" 
            icon={<Library className="w-6 h-6" />} 
          />
          <StatItem 
            end={1200} 
            suffix="+" 
            label="Community Cases" 
            icon={<Users className="w-6 h-6" />} 
          />
          <StatItem 
            end={350} 
            suffix="+" 
            label="Active Duels Today" 
            icon={<Swords className="w-6 h-6" />} 
          />
          {/* Top Rank Static Metric */}
          <div className="flex flex-col items-center justify-center p-6 text-center">
             <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 text-xl font-bold">
               🏅
             </div>
             <div className="text-3xl md:text-4xl font-black text-slate-900 dark:text-amber-400 mb-3 tracking-tight truncate w-full max-w-[200px]">
               Doc_1337
             </div>
             <div className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
               Top Rank This Week
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
