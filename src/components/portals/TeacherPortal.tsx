'use client';

import React, { useState } from 'react';
import { useTimetableStore } from '@/store/useTimetableStore';
import {
  User,
  Clock,
  MapPin,
  Calendar,
  Download,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

export const TeacherPortal: React.FC = () => {
  const { teachers, schedule, subjects, rooms, divisions, config } = useTimetableStore();
  const [selectedTeacherId, setSelectedTeacherId] = useState(teachers[0]?.id || '');

  const currentTeacher = teachers.find((t) => t.id === selectedTeacherId) || teachers[0];
  if (!currentTeacher) return null;

  const teacherEntries = schedule.filter((e) => e.teacherId === currentTeacher.id);
  const totalAssignedHours = teacherEntries.reduce((sum, e) => sum + e.span, 0);
  const periods = Array.from({ length: config.timings.periodsPerDay }, (_, i) => i + 1);

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Selector Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-purple-300 font-bold text-2xl border border-white/20 shrink-0">
            {currentTeacher.name.charAt(0)}
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/30 text-[11px] font-extrabold uppercase tracking-wider text-purple-200 mb-1">
              <span>{currentTeacher.teacherId}</span>
              <span>•</span>
              <span>Faculty Portal</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">{currentTeacher.name}</h2>
            <p className="text-xs text-purple-200 mt-0.5">{currentTeacher.department || 'Computer Science Engineering'}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
          >
            {teachers.map((t) => (
              <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                {t.name} ({t.teacherId})
              </option>
            ))}
          </select>

          <button
            onClick={handleDownloadPDF}
            className="px-5 py-2.5 rounded-xl bg-white text-indigo-950 font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Schedule</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {totalAssignedHours} / {currentTeacher.maxHoursPerWeek} hrs
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Weekly Teaching Load</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {new Set(teacherEntries.map((e) => e.subjectId)).size} Subjects
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Assigned Courses</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">Optimal</div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Workload Compliance</div>
          </div>
        </div>
      </div>

      {/* Personal Timetable Grid */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-sm overflow-x-auto">
        <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white mb-4">
          Personal Weekly Teaching Timetable
        </h3>

        <div className="min-w-[750px] grid grid-cols-[100px_repeat(6,_minmax(0,_1fr))] gap-2.5">
          <div className="font-bold text-xs text-slate-400 uppercase tracking-wider p-2">Day / Time</div>
          {periods.map((p) => (
            <div key={p} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 text-center font-bold text-xs text-slate-800 dark:text-slate-200">
              Period {p}
            </div>
          ))}

          {config.workingDays.map((day) => (
            <React.Fragment key={day}>
              <div className="flex items-center p-3 rounded-2xl bg-slate-100/60 dark:bg-slate-700/40 font-black text-xs text-slate-800 dark:text-slate-200">
                {day}
              </div>

              {periods.map((p) => {
                // Check if covered by 2-period practical block starting at p-1
                const covered = teacherEntries.find((e) => e.day === day && e.period < p && e.period + e.span > p);
                if (covered) {
                  return (
                    <div
                      key={`${day}-${p}-covered`}
                      className="p-2 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-dashed border-purple-300 dark:border-purple-800/60 text-center text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center justify-center"
                    >
                      Lab Session Continued
                    </div>
                  );
                }

                const entry = teacherEntries.find((e) => e.day === day && e.period === p);

                if (!entry) {
                  return (
                    <div
                      key={`${day}-${p}`}
                      className="p-3 rounded-2xl bg-slate-50/40 dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs text-slate-300 dark:text-slate-700 font-medium italic"
                    >
                      Free Period
                    </div>
                  );
                }

                const sub = subjects.find((s) => s.id === entry.subjectId);
                const rm = rooms.find((r) => r.id === entry.roomId);
                const div = divisions.find((d) => d.id === entry.divisionId);

                return (
                  <div
                    key={entry.id}
                    className="p-3 rounded-2xl border text-left shadow-xs transition-all hover:shadow-md flex flex-col justify-between"
                    style={{
                      backgroundColor: `${sub?.color || '#6366f1'}15`,
                      borderColor: `${sub?.color || '#6366f1'}50`,
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-black uppercase px-1.5 py-0.5 rounded bg-white/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {sub?.code || 'SUB'}
                        </span>
                        {entry.span > 1 && (
                          <span className="text-[10px] font-extrabold text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/60 px-1.5 py-0.5 rounded">
                            2P Lab
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2 leading-tight">
                        {sub?.name || 'Class Session'}
                      </div>
                    </div>

                    <div className="mt-2 pt-1 border-t border-slate-200/40 dark:border-slate-700/40 flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      <span>{div?.name || 'Div-A'}</span>
                      <span className="flex items-center text-slate-800 dark:text-slate-100">
                        <MapPin className="w-3 h-3 mr-0.5 text-slate-400" />
                        {rm?.roomNumber || 'Room N/A'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
