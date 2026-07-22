'use client';

import React from 'react';
import { useTimetableStore } from '@/store/useTimetableStore';
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
  LogOut,
  HelpCircle,
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
    currentUser,
    logout,
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

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-zinc-900/90 border-b border-zinc-200/80 dark:border-zinc-800 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-0 min-h-16 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
        {/* Brand Title */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white font-bold text-lg">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5">
              <span>Smart<span className="text-emerald-600 dark:text-emerald-400">Timetable</span></span>
              {currentUser && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hidden sm:inline-block">
                  {currentUser.identifier}
                </span>
              )}
            </h1>
            <div className="flex items-center space-x-1.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              <span>OR-Tools Engine</span>
              <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span className={`font-semibold ${metrics.overallScore >= 90 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                Score: {metrics.overallScore}%
              </span>
            </div>
          </div>
        </div>

        {/* Logged-In User Badge */}
        <div className="flex items-center space-x-2 bg-zinc-100/90 dark:bg-zinc-800/90 backdrop-blur-md px-3 sm:px-4 py-1.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 shadow-xs shrink-0">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-xs font-extrabold text-zinc-900 dark:text-white flex items-center gap-1.5">
            {currentRole === 'admin' ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Administrator Portal</span>
              </>
            ) : currentRole === 'teacher' ? (
              <>
                <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate max-w-[140px] sm:max-w-none">{currentUser?.name || `Teacher (${currentUser?.identifier})`}</span>
              </>
            ) : (
              <>
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate max-w-[140px] sm:max-w-none">Student Portal ({currentUser?.identifier})</span>
              </>
            )}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 justify-end w-full sm:w-auto">
          {/* Undo / Redo */}
          {currentRole === 'admin' && (
            <div className="flex items-center space-x-0.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700 shrink-0">
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                title="Undo last action"
                className="p-1.5 rounded text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                title="Redo action"
                className="p-1.5 rounded text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* AI Generation & Auto-Repair (Only Admin) */}
          {currentRole === 'admin' && (
            <>
              {hardConflictsCount > 0 ? (
                <button
                  onClick={() => autoRepair()}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs shadow-sm shadow-amber-500/20 active:scale-95 transition-all animate-bounce shrink-0"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Fix {hardConflictsCount} Conflict{hardConflictsCount > 1 ? 's' : ''}</span>
                </button>
              ) : (
                <button
                  onClick={() => autoRepair()}
                  title="Optimize & Clean Timetable"
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-semibold text-xs transition-all shrink-0"
                >
                  <Wrench className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden md:inline">Auto Repair</span>
                </button>
              )}

              <button
                onClick={() => generateTimetable()}
                disabled={isGenerating}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all shrink-0"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Generating...' : 'Generate'}</span>
              </button>
            </>
          )}

          {/* Export Button */}
          <button
            onClick={onOpenExport}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold text-xs transition-all shrink-0"
            title="Export PDF, Excel, CSV or Share QR"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-all shrink-0"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
          </button>

          {/* Sign Out Button */}
          <button
            onClick={logout}
            className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all shrink-0"
            title="Sign out of current role"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
