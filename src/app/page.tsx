'use client';

import React, { useState, useEffect } from 'react';
import { useTimetableStore } from '@/store/useTimetableStore';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { TimetableGrid } from '@/components/timetable/TimetableGrid';
import { VersionHistory } from '@/components/timetable/VersionHistory';
import { Dashboard } from '@/components/analytics/Dashboard';
import { AISuggestions } from '@/components/common/AISuggestions';
import { ExportModal } from '@/components/common/ExportModal';
import { InputPortal } from '@/components/inputs/InputPortal';
import { TeacherPortal } from '@/components/portals/TeacherPortal';
import { StudentPortal } from '@/components/portals/StudentPortal';
import { DayOfWeek, ScheduleEntry } from '@/lib/types';
import { Sparkles, Plus, X } from 'lucide-react';

export default function Home() {
  const {
    currentRole,
    generateTimetable,
    isGenerating,
    schedule,
    subjects,
    teachers,
    rooms,
    divisions,
    selectedDivisionId,
    addEntry,
    activeQuickAddSlot,
    closeQuickAddSlot,
  } = useTimetableStore();

  const [activeTab, setActiveTab] = useState('timetable');
  const [isDark, setIsDark] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [quickAddModal, setQuickAddModal] = useState<{ isOpen: boolean; day?: DayOfWeek; period?: number }>({
    isOpen: false,
  });

  // Quick add form states
  const [qSubjectId, setQSubjectId] = useState('');
  const [qTeacherId, setQTeacherId] = useState('');
  const [qRoomId, setQRoomId] = useState('');

  useEffect(() => {
    if (currentRole === 'teacher' || currentRole === 'student') {
      setActiveTab('timetable');
    }
  }, [currentRole]);

  const handleToggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetDay = activeQuickAddSlot?.day || quickAddModal.day;
    const targetPeriod = activeQuickAddSlot?.period || quickAddModal.period;
    if (!targetDay || !targetPeriod || !qSubjectId || !qTeacherId || !qRoomId) return;

    const sub = subjects.find((s) => s.id === qSubjectId);
    const span = sub?.type === 'Practical' ? 2 : 1;

    const newEntry: ScheduleEntry = {
      id: `man-${Date.now()}`,
      divisionId: selectedDivisionId || divisions[0]?.id || 'div-1',
      subjectId: qSubjectId,
      teacherId: qTeacherId,
      roomId: qRoomId,
      day: targetDay,
      period: targetPeriod,
      span,
      isLocked: false,
    };

    addEntry(newEntry);
    setQuickAddModal({ isOpen: false });
    closeQuickAddSlot();
    setQSubjectId('');
    setQTeacherId('');
    setQRoomId('');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      <Navbar
        onOpenExport={() => setExportModalOpen(true)}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Role Switcher Display logic */}
            {currentRole === 'teacher' ? (
              activeTab === 'analytics' ? <Dashboard /> : activeTab === 'suggestions' ? <AISuggestions /> : <TeacherPortal />
            ) : currentRole === 'student' ? (
              <StudentPortal />
            ) : (
              /* Admin Full View */
              <>
                {activeTab === 'timetable' && (
                  <div className="space-y-6">
                    {schedule.length === 0 && !isGenerating && (
                      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl text-center space-y-4">
                        <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto text-amber-300">
                          <Sparkles className="w-8 h-8 animate-spin" style={{ animationDuration: '6s' }} />
                        </div>
                        <h2 className="text-2xl font-black">No Timetable Generated Yet</h2>
                        <p className="text-sm text-indigo-200 max-w-md mx-auto">
                          Click the button below or in the top right to invoke our Google OR-Tools CP-SAT scheduling engine and generate an optimal conflict-free schedule.
                        </p>
                        <button
                          onClick={generateTimetable}
                          disabled={isGenerating}
                          className="px-8 py-3.5 rounded-2xl bg-white text-indigo-950 font-extrabold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all inline-flex items-center space-x-2"
                        >
                          <Sparkles className="w-4 h-4 text-indigo-600" />
                          <span>Generate Optimal Timetable Now</span>
                        </button>
                      </div>
                    )}

                    <TimetableGrid />
                  </div>
                )}

                {activeTab === 'analytics' && <Dashboard />}
                {activeTab === 'suggestions' && <AISuggestions />}
                {activeTab === 'inputs' && <InputPortal />}
                {activeTab === 'history' && <VersionHistory />}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Export Modal */}
      <ExportModal isOpen={exportModalOpen} onClose={() => setExportModalOpen(false)} />

      {/* Quick Add Modal */}
      {(quickAddModal.isOpen || activeQuickAddSlot !== null) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Add Session to {activeQuickAddSlot?.day || quickAddModal.day} Period {activeQuickAddSlot?.period || quickAddModal.period}
              </h3>
              <button
                onClick={() => {
                  setQuickAddModal({ isOpen: false });
                  closeQuickAddSlot();
                }}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                <select
                  value={qSubjectId}
                  onChange={(e) => {
                    setQSubjectId(e.target.value);
                    const sub = subjects.find((s) => s.id === e.target.value);
                    if (sub && sub.assignedTeacherId) {
                      setQTeacherId(sub.assignedTeacherId);
                    }
                  }}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name} ({s.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Teacher</label>
                <select
                  value={qTeacherId}
                  onChange={(e) => setQTeacherId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Teacher</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.teacherId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Room / Lab</label>
                <select
                  value={qRoomId}
                  onChange={(e) => setQRoomId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Classroom or Lab</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.roomNumber} ({r.type} - {r.capacity} seats)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setQuickAddModal({ isOpen: false });
                    closeQuickAddSlot();
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-xs text-slate-700 dark:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20"
                >
                  Add Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
