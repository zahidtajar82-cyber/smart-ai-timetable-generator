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
import { IntroCarousel } from '@/components/auth/IntroCarousel';
import { LoginPage } from '@/components/auth/LoginPage';
import { DayOfWeek, ScheduleEntry } from '@/lib/types';
import { Sparkles, Plus, X } from 'lucide-react';

export default function Home() {
  const {
    clearAllData,
    currentRole,
    isAuthenticated,
    hasSeenIntro,
    loadSampleData,
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
    const handleTabSwitch = (e: any) => {
      if (e.detail) setActiveTab(e.detail);
    };
    window.addEventListener('navigateToTab', handleTabSwitch);
    return () => window.removeEventListener('navigateToTab', handleTabSwitch);
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

  if (!hasSeenIntro) {
    return <IntroCarousel />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-zinc-100/80 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      <Navbar
        onOpenExport={() => setExportModalOpen(true)}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 flex overflow-hidden min-w-0">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-3 sm:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto w-full min-w-0 space-y-6">
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
                      <div className="bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl rounded-3xl p-8 sm:p-10 text-center shadow-xl space-y-5 max-w-2xl mx-auto">
                        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                          <Sparkles className="w-8 h-8 animate-pulse" />
                        </div>
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">No Timetable Generated Yet</h2>
                          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto mt-2 leading-relaxed">
                            You can immediately generate an optimal, 100% conflict-free schedule with our pre-loaded CSE faculty catalog, or clear the sample entries to add your own real teachers and subjects.
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                          <button
                            onClick={generateTimetable}
                            disabled={isGenerating}
                            className="px-6 sm:px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition-all inline-flex items-center space-x-2"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>Generate With Current Data</span>
                          </button>
                          <button
                            onClick={() => setActiveTab('inputs')}
                            className="px-6 py-3.5 rounded-2xl bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-extrabold text-xs sm:text-sm transition-all inline-flex items-center space-x-2 shadow-md"
                          >
                            <span>✏️ Enter My Own Teachers & Subjects</span>
                          </button>
                          {teachers.length > 0 && (
                            <button
                              onClick={() => {
                                if (confirm('Clear sample data and start fresh to input your faculty?')) {
                                  clearAllData();
                                  setActiveTab('inputs');
                                }
                              }}
                              className="px-5 py-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 font-bold text-xs sm:text-sm transition-all"
                            >
                              Clear Sample Data
                            </button>
                          )}
                        </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                Add Session to {activeQuickAddSlot?.day || quickAddModal.day} Period {activeQuickAddSlot?.period || quickAddModal.period}
              </h3>
              <button
                onClick={() => {
                  setQuickAddModal({ isOpen: false });
                  closeQuickAddSlot();
                }}
                className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Subject</label>
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="" className="bg-zinc-900 text-white">Select Subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id} className="bg-zinc-900 text-white">
                      {s.code} - {s.name} ({s.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Teacher</label>
                <select
                  value={qTeacherId}
                  onChange={(e) => setQTeacherId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="" className="bg-zinc-900 text-white">Select Teacher</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id} className="bg-zinc-900 text-white">
                      {t.name} ({t.teacherId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Room / Lab</label>
                <select
                  value={qRoomId}
                  onChange={(e) => setQRoomId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="" className="bg-zinc-900 text-white">Select Classroom or Lab</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id} className="bg-zinc-900 text-white">
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
                  className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-semibold text-xs text-zinc-700 dark:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
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
