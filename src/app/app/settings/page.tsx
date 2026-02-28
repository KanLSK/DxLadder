'use client';

import React from 'react';
import { User, Bell, Palette, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
    return (
        <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <header className="mb-10">
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                    Settings
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                    Manage your account and preferences.
                </p>
            </header>

            <div className="flex flex-col md:flex-row gap-8 items-start">
                
                {/* Desktop Tabs */}
                <div className="w-full md:w-64 flex-shrink-0 space-y-1">
                    {[
                        { label: 'Profile', icon: User, active: true },
                        { label: 'Notifications', icon: Bell, active: false },
                        { label: 'Appearance', icon: Palette, active: false },
                        { label: 'Billing & Pro', icon: CreditCard, active: false },
                    ].map((tab, i) => (
                        <button key={i} className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg transition-all text-left",
                            tab.active 
                                ? "bg-white dark:bg-[#18181B] text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-zinc-800/60" 
                                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-zinc-900/50 dark:hover:text-white border border-transparent"
                        )}>
                            <tab.icon className={cn("w-4 h-4", tab.active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400")} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white dark:bg-[#18181B] rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 shadow-sm p-6 md:p-10 w-full space-y-8">
                    
                    <section>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Profile Settings</h2>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Display Name</label>
                                <input type="text" defaultValue="Dr. Smith" className="w-full bg-slate-50 dark:bg-[#09090B] border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 font-medium outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all text-slate-900 dark:text-white" />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                                <input type="email" defaultValue="dr.smith@hospital.org" disabled className="w-full bg-slate-100/50 dark:bg-[#09090B]/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 font-medium text-slate-500 dark:text-slate-400 cursor-not-allowed" />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Training Level</label>
                                <select className="w-full bg-slate-50 dark:bg-[#09090B] border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 font-medium outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all text-slate-900 dark:text-white appearance-none">
                                    <option>Medical Student (Clinical)</option>
                                    <option>Medical Student (Pre-clinical)</option>
                                    <option>Resident</option>
                                    <option>Attending</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-end border-t border-slate-100 dark:border-zinc-800/60 pt-6">
                            <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-sm active:scale-95">
                                Save Changes
                            </button>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
