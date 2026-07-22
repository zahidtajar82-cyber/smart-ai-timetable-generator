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
      icon: Calendar,
      badge: hardConflictsCount > 0 ? hardConflictsCount : null,
      badgeColor: 'bg-rose-500 text-white animate-pulse',
      roles: ['admin', 'teacher', 'student'],
    },
    {
      id: 'analytics',
      label: 'AI Quality & Analytics',
      icon: BarChart3,
      badge: null,
      roles: ['admin', 'teacher'],
    },
    {
      id: 'suggestions',
      label: 'AI Suggestions',
      icon: Lightbulb,
      badge: suggestions.length > 0 ? suggestions.length : null,
      badgeColor: 'bg-amber-500 text-white',
      roles: ['admin', 'teacher'],
    },
    {
      id: 'inputs',
      label: 'Institution Setup',
      icon: Sliders,
      badge: null,
      roles: ['admin'],
    },
    {
      id: 'history',
      label: 'Version History',
      icon: History,
      badge: history.length,
      badgeColor: 'bg-indigo-500 text-white',
      roles: ['admin'],
    },
  ];

  const visibleTabs = tabs.filter((t) => t.roles.includes(currentRole));

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 backdrop-blur-md p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
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
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600/10 to-purple-600/10 dark:from-indigo-500/20 dark:to-purple-500/20 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200/60 dark:border-indigo-800/60 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== null && tab.badge !== undefined && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold shadow-xs ${tab.badgeColor || 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Live System Status Banner */}
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center space-x-2">
            {hardConflictsCount === 0 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-500 animate-bounce" />
            )}
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {hardConflictsCount === 0 ? 'Conflict-Free Schedule' : `${hardConflictsCount} Active Conflicts`}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {hardConflictsCount === 0 ? 'All constraints satisfied' : 'Requires AI resolution or manual fix'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Notice */}
      <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/60">
        <div className="text-xs font-bold text-indigo-900 dark:text-indigo-300 capitalize">
          {currentRole} Mode Active
        </div>
        <div className="text-[11px] text-indigo-700 dark:text-indigo-400 mt-0.5 leading-snug">
          {currentRole === 'admin'
            ? 'Full drag & drop editing, AI generation and auto-repair permissions enabled.'
            : currentRole === 'teacher'
            ? 'Viewing workload and personal availability schedule.'
            : 'Read-only student access. Download PDF from top menu.'}
        </div>
      </div>
    </aside>
  );
};
