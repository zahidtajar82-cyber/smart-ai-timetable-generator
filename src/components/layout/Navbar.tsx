'use client';

import React from 'react';
import { useTimetableStore } from '@/store/useTimetableStore';
import { UserRole } from '@/lib/types';
import {
  Sparkles,
  Wrench,
  Undo2,
  Redo2,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Moon,
  Sun,
  Download,
  AlertTriangle,
} from 'lucide-react';

interface NavbarProps {
  onOpenExport: () => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenExport,
  isDark = false,
  onToggleTheme,
  activeTab = 'timetable',
  setActiveTab,
}) => {
  const {
    currentRole,
    setRole,
    generateTimetable,
    isGenerating,
    autoRepair,
    undo,
    redo,
    historyIndex,
    history,
    conflicts,
    metrics,
  } = useTimetableStore();

  const hardConflictsCount = conflicts.filter((c) => c.severity === 'hard').length;

  const handleRoleChange = (role: UserRole) => {
    setRole(role);
    if (setActiveTab) {
      if (role === 'teacher' && activeTab === 'inputs') {
        setActiveTab('timetable');
      } else if (role === 'student' && (activeTab === 'inputs' || activeTab === 'history' || activeTab === 'analytics')) {
        setActiveTab('timetable');
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 text-white font-bold text-xl">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Antigravity AI Timetable
            </h1>
            <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>Next-Gen CP-SAT & CSP Scheduler</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span className={`flex items-center font-semibold ${metrics.overallScore >= 90 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                Quality: {metrics.overallScore}%
              </span>
            </div>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <button
            onClick={() => handleRoleChange('admin')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
              currentRole === 'admin'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
          <button
            onClick={() => handleRoleChange('teacher')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
              currentRole === 'teacher'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Teacher</span>
          </button>
          <button
            onClick={() => handleRoleChange('student')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
              currentRole === 'student'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student</span>
          </button>
        </div>

        {/* Action Controls & AI Triggers */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Undo / Redo */}
          {currentRole === 'admin' && (
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                title="Undo last action"
                className="p-1.5 rounded text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                title="Redo action"
                className="p-1.5 rounded text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* AI Generation & Auto-Repair (Only Admin) */}
          {currentRole === 'admin' && (
            <>
              {hardConflictsCount > 0 ? (
                <button
                  onClick={() => autoRepair()}
                  className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all animate-bounce"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Fix {hardConflictsCount} Conflict{hardConflictsCount > 1 ? 's' : ''}</span>
                </button>
              ) : (
                <button
                  onClick={() => autoRepair()}
                  title="Optimize & Clean Timetable"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium text-xs transition-all"
                >
                  <Wrench className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Auto Repair</span>
                </button>
              )}

              <button
                onClick={() => generateTimetable()}
                disabled={isGenerating}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-indigo-500/25 active:scale-95 transition-all"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Generating...' : 'AI Generate'}</span>
              </button>
            </>
          )}

          {/* Export / Print Button */}
          <button
            onClick={onOpenExport}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs transition-all"
            title="Export PDF, Excel, CSV or Share QR"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
