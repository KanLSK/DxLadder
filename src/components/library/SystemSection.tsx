'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SystemSectionProps {
    title: string;
    icon?: React.ReactNode;
    defaultExpanded?: boolean;
    children: React.ReactNode;
    count: number;
}

export function SystemSection({ title, icon, defaultExpanded = false, children, count }: SystemSectionProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className="mb-12">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="group w-full flex items-center justify-between py-3 mb-2 cursor-pointer outline-none border-b border-black/5 dark:border-white/5 pb-4"
            >
                <div className="flex items-center gap-3">
                    {icon || <Activity className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />}
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        {title}
                        <span className="text-slate-400 dark:text-slate-500 text-sm font-medium bg-black/5 dark:bg-white/5 px-2.5 py-0.5 rounded-full">
                            {count}
                        </span>
                    </h3>
                </div>
                
                <div className="flex items-center text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors">
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </div>
            </button>

            {isExpanded && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-300 space-y-1">
                    {children}
                </div>
            )}
        </div>
    );
}
