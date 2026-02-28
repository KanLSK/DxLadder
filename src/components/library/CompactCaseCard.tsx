import React from 'react';
import { Star, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface CaseSummary {
    _id: string;
    finalDiagnosis: string;
    difficulty: number;
    sourceType: string;
    systemTags?: string[];
}

export function CompactCaseCard({ caseData }: { caseData: CaseSummary }) {
    return (
        <Link 
            href={`/play?mode=library&id=${caseData._id}`}
            className="group flex items-center justify-between px-3 py-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all"
        >
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-base text-slate-800 dark:text-slate-200 truncate capitalize group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {caseData.finalDiagnosis}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center tracking-wider">
                           {'★'.repeat(caseData.difficulty)}{'☆'.repeat(5 - caseData.difficulty)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
                {caseData.sourceType === 'community_promoted' && (
                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        Community
                    </span>
                )}
                
                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
            </div>
        </Link>
    );
}
