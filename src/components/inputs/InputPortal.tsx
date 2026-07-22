'use client';

import React, { useState } from 'react';
import { useTimetableStore } from '@/store/useTimetableStore';
import { InstitutionForm } from './InstitutionForm';
import { TeacherManager } from './TeacherManager';
import { SubjectManager } from './SubjectManager';
import { RoomManager } from './RoomManager';
import { DivisionManager } from './DivisionManager';
import {
  Building,
  Users,
  BookOpen,
  Building2,
  Layers,
  Trash2,
  PlusCircle,
  Sparkles,
} from 'lucide-react';

export const InputPortal: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<
    'institution' | 'teachers' | 'subjects' | 'rooms' | 'divisions'
  >('teachers'); // Default to teachers so users immediately see where to input faculty

  const { clearAllData, loadSampleData, teachers, subjects, rooms, divisions } = useTimetableStore();

  const subTabs = [
    { id: 'teachers', label: 'Faculty Roster & Limits', icon: Users, count: teachers.length },
    { id: 'subjects', label: 'Subjects & Course Catalog', icon: BookOpen, count: subjects.length },
    { id: 'rooms', label: 'Classrooms & Laboratories', icon: Building2, count: rooms.length },
    { id: 'divisions', label: 'Divisions & Batches', icon: Layers, count: divisions.length },
    { id: 'institution', label: 'Institution & Timings', icon: Building, count: null },
  ];

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all current/sample faculty, subjects, rooms, and divisions? You will start with a clean slate to input your own data.')) {
      clearAllData();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero Data Management Action Bar */}
      <div className="bg-gradient-to-r from-emerald-600/10 via-zinc-900/5 to-teal-500/10 dark:from-emerald-950/40 dark:via-zinc-900/80 dark:to-teal-950/40 rounded-3xl p-5 sm:p-6 border border-emerald-500/20 dark:border-zinc-800/80 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Clean Input Center</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Manage Faculty & Academic Data
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl">
            Input your own real teachers, subjects, classrooms, and divisions here. Once entered, the AI solver guarantees a 100% conflict-free timetable.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
          {teachers.length > 0 || subjects.length > 0 ? (
            <button
              onClick={handleClearData}
              className="flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 text-rose-600 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-800/60 transition-all shadow-xs"
              title="Clear pre-loaded sample data and enter your own clean entries"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Sample Data</span>
            </button>
          ) : (
            <button
              onClick={loadSampleData}
              className="flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs border border-zinc-200 dark:border-zinc-700 transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Load Sample CSE Data</span>
            </button>
          )}

          <button
            onClick={() => setActiveSubTab('teachers')}
            className="flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add My Teachers</span>
          </button>
        </div>
      </div>

      {/* Sub-tab navigation */}
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl p-3 sm:p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-1.5 w-full">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md scale-[1.02]'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400 dark:text-emerald-600' : 'text-zinc-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                      isActive
                        ? 'bg-white/20 dark:bg-zinc-900/20 text-white dark:text-zinc-900'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Panel */}
      <div className="pt-1">
        {activeSubTab === 'teachers' && <TeacherManager />}
        {activeSubTab === 'subjects' && <SubjectManager />}
        {activeSubTab === 'rooms' && <RoomManager />}
        {activeSubTab === 'divisions' && <DivisionManager />}
        {activeSubTab === 'institution' && <InstitutionForm />}
      </div>
    </div>
  );
};
