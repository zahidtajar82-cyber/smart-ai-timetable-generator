'use client';

import React from 'react';
import { useTimetableStore } from '@/store/useTimetableStore';
import {
  Calendar,
  BarChart3,
  Sliders,
  Lightbulb,
  History,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentRole, conflicts, suggestions, history } = useTimetableStore();
  const hardConflictsCount = conflicts.filter((c) => c.severity === 'hard').length;

  const tabs = [
    {
      id: 'timetable',
      label: 'Interactive Grid',
      shortLabel: 'Grid',
      icon: Calendar,
      badge: hardConflictsCount > 0 ? hardConflictsCount : null,
      badgeColor: 'bg-rose-500 text-white animate-pulse',
      roles: ['admin', 'teacher', 'student'],
    },
    {
      id: 'analytics',
      label: 'AI Quality & Analytics',
      shortLabel: 'Analytics',
      icon: BarChart3,
      badge: null,
      roles: ['admin', 'teacher'],
    },
    {
      id: 'suggestions',
      label: 'AI Suggestions',
      shortLabel: 'Suggestions',
      icon: Lightbulb,
      badge: suggestions.length > 0 ? suggestions.length : null,
      badgeColor: 'bg-amber-500 text-white',
      roles: ['admin', 'teacher'],
    },
    {
      id: 'inputs',
      label: 'Institution Setup',
      shortLabel: 'Inputs',
      icon: Sliders,
      badge: null,
      roles: ['admin'],
    },
    {
      id: 'history',
      label: 'Version History',
      shortLabel: 'History',
      icon: History,
      badge: history.length > 0 ? history.length : null,
      badgeColor: 'bg-emerald-600 text-white',
      roles: ['admin'],
    },
  ];

  const visibleTabs = tabs.filter((t) => t.roles.includes(currentRole));

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 shrink-0 border-r border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60 backdrop-blur-md p-4 flex flex-col justify-between hidden md:flex">
        <div className="space-y-6">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-3 mb-2">
              Navigation Portal
            </div>
            <nav className="space-y-1">
              {visibleTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 ${
                      isActive
                        ? 'bg-emerald-600/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'}`} />
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge !== null && tab.badge !== undefined && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold shadow-xs ${tab.badgeColor || 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'}`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Live System Status Banner */}
          <div className="bg-white dark:bg-zinc-900/80 rounded-2xl p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center space-x-2.5">
              {hardConflictsCount === 0 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-500 animate-bounce shrink-0" />
              )}
              <div>
                <div className="text-xs font-bold text-zinc-900 dark:text-white">
                  {hardConflictsCount === 0 ? 'Conflict-Free Schedule' : `${hardConflictsCount} Active Conflicts`}
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">
                  {hardConflictsCount === 0 ? 'All constraints satisfied' : 'Requires AI resolution or manual fix'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Role Notice */}
        <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200/70 dark:border-emerald-800/60">
          <div className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200 capitalize">
            {currentRole} Mode Active
          </div>
          <div className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-1 leading-snug font-medium">
            {currentRole === 'admin'
              ? 'Full drag & drop editing, AI generation and auto-repair permissions enabled.'
              : currentRole === 'teacher'
              ? 'Viewing workload and personal availability schedule.'
              : 'Read-only student access. Download PDF from top menu.'}
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (< md) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 flex md:hidden items-center justify-around py-2 px-1 shadow-lg">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-zinc-500 dark:text-zinc-400 font-medium hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'}`} />
                {tab.badge !== null && tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 text-[9px] font-black rounded-full bg-rose-500 text-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1">{tab.shortLabel}</span>
              {isActive && (
                <div className="absolute bottom-0 w-4 h-0.5 bg-emerald-600 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
