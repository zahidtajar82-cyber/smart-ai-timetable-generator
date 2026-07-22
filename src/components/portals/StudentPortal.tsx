'use client';

import React, { useState } from 'react';
import { useTimetableStore } from '@/store/useTimetableStore';
import {
  GraduationCap,
  Download,
  Share2,
  MapPin,
  User,
} from 'lucide-react';

export const StudentPortal: React.FC = () => {
  const { divisions, schedule, subjects, teachers, rooms, config, selectedDivisionId: storeDivisionId, setSelectedDivisionId: setStoreDivisionId } = useTimetableStore();
  const [selectedDivisionId, setSelectedDivisionId] = useState(storeDivisionId || divisions[0]?.id || '');

  const activeDivision = divisions.find((d) => d.id === selectedDivisionId) || divisions.find((d) => d.id === storeDivisionId) || divisions[0];
  if (!activeDivision) return null;

  const divisionEntries = schedule.filter((e) => e.divisionId === activeDivision.id);
  const periods = Array.from({ length: config.timings.periodsPerDay }, (_, i) => i + 1);

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${activeDivision.name} Timetable`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 w-full min-w-0">
      {/* Top Banner */}
      <div className="bg-zinc-900 dark:bg-zinc-900/90 rounded-3xl p-6 sm:p-8 text-white shadow-xs border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-950/60 flex items-center justify-center text-emerald-400 font-bold text-2xl border border-emerald-500/30 shrink-0">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-[11px] font-extrabold uppercase tracking-wider text-emerald-300 mb-1">
              <span>{config.department}</span>
              <span>•</span>
              <span>Student Access</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">{activeDivision.name} Timetable</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Semester {activeDivision.semester} • {activeDivision.strength} Enrolled Students
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <select
            value={activeDivision.id}
            onChange={(e) => {
              setSelectedDivisionId(e.target.value);
              setStoreDivisionId(e.target.value);
            }}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-xs sm:text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
          >
            {divisions.map((d) => (
              <option key={d.id} value={d.id} className="bg-zinc-900 text-white">
                {d.name} (Sem {d.semester})
              </option>
            ))}
          </select>

          <button
            onClick={handleDownloadPDF}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Schedule</span>
          </button>

          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white flex items-center justify-center transition-all"
            title="Share Schedule Link"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid Schedule */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-x-auto">
        <h3 className="font-extrabold text-base sm:text-lg text-zinc-900 dark:text-white mb-4">
          Weekly Division Schedule
        </h3>

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
                const covered = divisionEntries.find((e) => e.day === day && e.period < p && e.period + e.span > p);
                if (covered) {
                  return (
                    <div
                      key={`${day}-${p}-covered`}
                      className="p-2 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-dashed border-emerald-300 dark:border-emerald-800/60 text-center text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center"
                    >
                      Practical Lab Continued
                    </div>
                  );
                }

                const entry = divisionEntries.find((e) => e.day === day && e.period === p);

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
                const tea = teachers.find((t) => t.id === entry.teacherId);
                const rm = rooms.find((r) => r.id === entry.roomId);

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
                            2P Practical
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-xs text-zinc-900 dark:text-white line-clamp-2 leading-tight">
                        {sub?.name || 'Class Session'}
                      </div>
                    </div>

                    <div className="mt-2 pt-1 border-t border-zinc-200/40 dark:border-zinc-700/40 space-y-1 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">
                      <div className="flex items-center truncate">
                        <User className="w-3 h-3 mr-1 text-zinc-400 shrink-0" />
                        <span className="truncate">{tea?.name || 'Prof. Unassigned'}</span>
                      </div>
                      <div className="flex items-center text-zinc-800 dark:text-zinc-100 font-bold">
                        <MapPin className="w-3 h-3 mr-1 text-zinc-400 shrink-0" />
                        <span>{rm?.roomNumber || 'Room N/A'}</span>
                      </div>
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
