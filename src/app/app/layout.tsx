import React, { Suspense } from 'react';
import { SaaSNavigation } from '@/components/layout/SaaSNavigation';
import { TopAppBar } from '@/components/layout/TopAppBar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#09090B] text-slate-900 dark:text-slate-50 flex flex-col md:flex-row">
       <Suspense fallback={<div className="w-64" />}>
         <SaaSNavigation />
       </Suspense>
       
       <div className="flex-1 flex flex-col min-w-0">
           <TopAppBar />
           <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8 pb-24 md:pb-8">
               {children}
           </main>
       </div>
    </div>
  );
}
