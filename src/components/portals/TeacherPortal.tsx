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
    <div className="space-y-6 animate-in fade-in duration-200 w-full min-w-0">
      {/* Top Selector Banner */}
      <div className="bg-zinc-900 dark:bg-zinc-900/90 rounded-3xl p-6 sm:p-8 text-white shadow-xs border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-950/60 flex items-center justify-center text-emerald-400 font-bold text-2xl border border-emerald-500/30 shrink-0">
            {currentTeacher.name.charAt(0)}
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-[11px] font-extrabold uppercase tracking-wider text-emerald-300 mb-1">
              <span>{currentTeacher.teacherId}</span>
              <span>•</span>
              <span>Faculty Portal</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">{currentTeacher.name}</h2>
            <p className="text-xs text-zinc-400 mt-0.5">{currentTeacher.department || 'Computer Science Engineering'}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-xs sm:text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
          >
            {teachers.map((t) => (
              <option key={t.id} value={t.id} className="bg-zinc-900 text-white">
                {t.name} ({t.teacherId})
              </option>
            ))}
          </select>

          <button
            onClick={handleDownloadPDF}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Schedule</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-zinc-900 dark:text-white">
              {totalAssignedHours} / {currentTeacher.maxHoursPerWeek} hrs
            </div>
            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Weekly Teaching Load</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-zinc-900 dark:text-white">
              {new Set(teacherEntries.map((e) => e.subjectId)).size} Subjects
            </div>
            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Assigned Courses</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-zinc-900 dark:text-white">
              {(currentTeacher.preferredSlots || []).length} Slots
            </div>
            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Preferred Availability</div>
          </div>
        </div>
      </div>

      {/* Teacher Schedule Grid */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">Personal Teaching Schedule</h3>
          </div>
          <span className="text-xs text-zinc-400 font-semibold hidden sm:inline">
            Read-only customized faculty view
          </span>
        </div>

        <div className="min-w-[760px] grid grid-cols-[100px_1fr] gap-3">
          <div className="font-bold text-xs text-zinc-400 uppercase tracking-wider p-2">
            Day / Period
          </div>

          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${periods.length}, minmax(0, 1fr))`,
            }}
          >
            {periods.map((p) => (
              <div key={p} className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 text-center font-black text-xs text-zinc-800 dark:text-zinc-200">
                Period {p}
              </div>
            ))}
          </div>

          {config.workingDays.map((day) => (
            <React.Fragment key={day}>
              <div className="flex items-center p-3 rounded-2xl bg-zinc-100/60 dark:bg-zinc-800/40 font-black text-sm text-zinc-800 dark:text-zinc-200">
                {day}
              </div>

              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${periods.length}, minmax(0, 1fr))`,
                }}
              >
                {periods.map((p) => {
                  // Check if covered by 2-period practical block starting at p-1
                  const covered = teacherEntries.find((e) => e.day === day && e.period < p && e.period + e.span > p);
                  if (covered) {
                    return (
                      <div
                        key={`${day}-${p}-covered`}
                        className="p-2 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-dashed border-emerald-300 dark:border-emerald-800/60 text-center text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center"
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
                        className="p-3 rounded-2xl bg-zinc-50/40 dark:bg-zinc-900/20 border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-xs text-zinc-300 dark:text-zinc-700 font-medium italic"
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
                        backgroundColor: `${sub?.color || '#10b981'}15`,
                        borderColor: `${sub?.color || '#10b981'}50`,
                      }}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-black uppercase px-1.5 py-0.5 rounded bg-white/80 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                            {sub?.code || 'SUB'}
                          </span>
                          {entry.span > 1 && (
                            <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded">
                              2P Lab
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-xs text-zinc-900 dark:text-white line-clamp-2 leading-tight">
                          {sub?.name || 'Class Session'}
                        </div>
                      </div>

                      <div className="mt-2 pt-1 border-t border-zinc-200/40 dark:border-zinc-700/40 flex items-center justify-between text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1 text-zinc-400" />
                          {rm?.name || rm?.roomNumber || entry.roomId}
                        </span>
                        <span className="font-extrabold text-emerald-700 dark:text-emerald-300">
                          {div?.name || entry.divisionId}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
