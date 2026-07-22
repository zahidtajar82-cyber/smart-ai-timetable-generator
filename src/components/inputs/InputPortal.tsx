'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

export const InputPortal: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<
    'institution' | 'teachers' | 'subjects' | 'rooms' | 'divisions'
  >('institution');

  const subTabs = [
    { id: 'institution', label: 'Institution & Timings', icon: Building },
    { id: 'teachers', label: 'Faculty Roster & Limits', icon: Users },
    { id: 'subjects', label: 'Subjects & Course Catalog', icon: BookOpen },
    { id: 'rooms', label: 'Classrooms & Laboratories', icon: Building2 },
    { id: 'divisions', label: 'Divisions & Batches', icon: Layers },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Sub-tab navigation */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Institutional Constraints & Data Setup
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure parameters before running AI CP-SAT generator or manual adjustments
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-slate-700/80 p-1.5 rounded-2xl w-full sm:w-auto">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-xs scale-[1.02]'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Panel */}
      <div className="pt-1">
        {activeSubTab === 'institution' && <InstitutionForm />}
        {activeSubTab === 'teachers' && <TeacherManager />}
        {activeSubTab === 'subjects' && <SubjectManager />}
        {activeSubTab === 'rooms' && <RoomManager />}
        {activeSubTab === 'divisions' && <DivisionManager />}
      </div>
    </div>
  );
};
