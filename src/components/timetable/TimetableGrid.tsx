'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { useTimetableStore } from '@/store/useTimetableStore';
import { DayOfWeek, ScheduleEntry } from '@/lib/types';
import { DroppableSlot } from './DroppableSlot';
import { ClassCard } from './ClassCard';
import { ConflictDialog } from './ConflictDialog';
import {
  Clock,
  Utensils,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  Layers,
} from 'lucide-react';

export const TimetableGrid: React.FC = () => {
  const {
    schedule,
    config,
    subjects,
    teachers,
    rooms,
    divisions,
    selectedDivisionId,
    setSelectedDivisionId,
    currentRole,
    moveEntry,
    conflicts,
  } = useTimetableStore();

  const [activeDragEntry, setActiveDragEntry] = useState<ScheduleEntry | null>(null);
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [activeConflictDesc, setActiveConflictDesc] = useState('');
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const entry = schedule.find((e) => e.id === event.active.id);
    if (entry) {
      setActiveDragEntry(entry);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragEntry(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const entry = schedule.find((e) => e.id === active.id);
    const overData = over.data.current as { day: DayOfWeek; period: number } | undefined;

    if (entry && overData) {
      if (entry.day === overData.day && entry.period === overData.period) return;

      const validation = moveEntry(entry.id, overData.day, overData.period);

      if (!validation.isValid && validation.conflicts.length > 0) {
        const firstHard = validation.conflicts.find((c) => c.severity === 'hard');
        if (firstHard) {
          setActiveConflictDesc(firstHard.description);
          setConflictModalOpen(true);
        }
      }
    }
  };

  // Build a map of entry ID -> hard conflict description
  const conflictsMap = new Map<string, string>();
  for (const c of conflicts) {
    if (c.severity === 'hard') {
      for (const eId of c.entryIds) {
        conflictsMap.set(eId, c.description);
      }
    }
  }

  const activeDivision = divisions.find((d) => d.id === selectedDivisionId) || divisions[0];
  const periods = Array.from({ length: config.timings.periodsPerDay }, (_, i) => i + 1);

  // Helper for period timing strings
  const getPeriodTimeString = (p: number) => {
    const startHour = parseInt(config.timings.startTime.split(':')[0], 10);
    const startMin = parseInt(config.timings.startTime.split(':')[1], 10);
    const totalMinsStart = startHour * 60 + startMin + (p - 1) * config.timings.periodDurationMinutes + (p > config.timings.lunchAfterPeriod ? config.timings.lunchDurationMinutes : 0);
    const totalMinsEnd = totalMinsStart + config.timings.periodDurationMinutes;

    const formatTime = (mins: number) => {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    return `${formatTime(totalMinsStart)} - ${formatTime(totalMinsEnd)}`;
  };

  const displayedDivisions = viewMode === 'single' ? [activeDivision] : divisions;

  return (
    <div className="space-y-6">
      {/* Top Filter & Control Header */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Academic Timetable Grid
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Drag and drop cards to adjust schedule. All constraints validated instantly in real time.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-700/80 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('single')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'single'
                  ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Single Division
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'all'
                  ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Compare All ({divisions.length})
            </button>
          </div>

          {/* Division Selector Dropdown (when single view) */}
          {viewMode === 'single' && (
            <div className="relative shrink-0">
              <select
                value={selectedDivisionId}
                onChange={(e) => setSelectedDivisionId(e.target.value)}
                className="appearance-none pl-4 pr-9 py-2 rounded-xl bg-slate-100 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}
        </div>
      </div>

      {/* Grid Layouts for Displayed Divisions */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="space-y-10">
          {displayedDivisions.map((division) => {
            if (!division) return null;

            return (
              <div
                key={division.id}
                className="bg-white dark:bg-slate-800/90 rounded-3xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-700 shadow-sm overflow-x-auto"
              >
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-700/60 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                      {division.name}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                      {division.strength} Students
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-medium hidden sm:block">
                    {config.workingDays.length} Days | {config.timings.periodsPerDay} Periods per Day
                  </div>
                </div>

                {/* Grid Table */}
                <div className="min-w-[800px] grid grid-cols-[110px_1fr] gap-3">
                  {/* Column 1: Day Labels Column Header */}
                  <div className="font-bold text-xs text-slate-400 uppercase tracking-wider p-2 flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    <span>Day / Time</span>
                  </div>

                  {/* Column Headers: Periods */}
                  <div
                    className="grid gap-2"
                    style={{
                      gridTemplateColumns: `repeat(${periods.length + 1}, minmax(0, 1fr))`,
                    }}
                  >
                    {periods.map((p) => (
                      <React.Fragment key={p}>
                        <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-700/60 text-center">
                          <div className="text-xs font-black text-slate-800 dark:text-slate-200">
                            Period {p}
                          </div>
                          <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                            {getPeriodTimeString(p)}
                          </div>
                        </div>

                        {/* Insert Lunch Column Header right after config.timings.lunchAfterPeriod */}
                        {p === config.timings.lunchAfterPeriod && (
                          <div className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 text-center flex flex-col items-center justify-center">
                            <Utensils className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 mb-0.5" />
                            <span className="text-[11px] font-extrabold text-amber-800 dark:text-amber-300 uppercase tracking-tight">
                              Lunch Break
                            </span>
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Day Rows */}
                  {config.workingDays.map((day) => {
                    const divisionEntries = schedule.filter(
                      (e) => e.divisionId === division.id && e.day === day
                    );

                    return (
                      <React.Fragment key={`${division.id}-${day}`}>
                        {/* Day Name Label */}
                        <div className="flex items-center p-3 rounded-2xl bg-slate-100/60 dark:bg-slate-700/40 font-black text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                          {day}
                        </div>

                        {/* Slots along the day */}
                        <div
                          className="grid gap-2"
                          style={{
                            gridTemplateColumns: `repeat(${periods.length + 1}, minmax(0, 1fr))`,
                          }}
                        >
                          {periods.map((p) => {
                            // Check if this period is already covered by a multi-period practical session starting earlier
                            const coveredByLab = divisionEntries.find(
                              (e) => e.period < p && e.period + e.span > p
                            );
                            if (coveredByLab) {
                              return (
                                <div
                                  key={`${day}-${p}-covered`}
                                  className="rounded-2xl bg-purple-50/30 dark:bg-purple-950/10 border border-dashed border-purple-200 dark:border-purple-900/40 flex items-center justify-center text-[11px] font-semibold text-purple-400 dark:text-purple-500 italic p-2"
                                >
                                  Practical Continued ({coveredByLab.span}P)
                                </div>
                              );
                            }

                            const slotEntries = divisionEntries.filter((e) => e.period === p);

                            return (
                              <React.Fragment key={`${day}-${p}`}>
                                <DroppableSlot
                                  day={day}
                                  period={p}
                                  entries={slotEntries}
                                  subjects={subjects}
                                  teachers={teachers}
                                  rooms={rooms}
                                  currentRole={currentRole}
                                  conflictsMap={conflictsMap}
                                  onOpenConflictDialog={(desc) => {
                                    setActiveConflictDesc(desc);
                                    setConflictModalOpen(true);
                                  }}
                                />

                                {/* Lunch Divider after lunchAfterPeriod */}
                                {p === config.timings.lunchAfterPeriod && (
                                  <div className="rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 flex items-center justify-center p-2">
                                    <Utensils className="w-4 h-4 text-amber-500/60 dark:text-amber-400/40 animate-pulse" />
                                  </div>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Drag Overlay for smooth 3D visual feedback */}
        <DragOverlay>
          {activeDragEntry ? (
            <div className="w-48 sm:w-56 opacity-95 scale-105 shadow-2xl pointer-events-none">
              <ClassCard
                entry={activeDragEntry}
                subject={subjects.find((s) => s.id === activeDragEntry.subjectId)}
                teacher={teachers.find((t) => t.id === activeDragEntry.teacherId)}
                room={rooms.find((r) => r.id === activeDragEntry.roomId)}
                currentRole={currentRole}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Conflict Dialog */}
      <ConflictDialog
        isOpen={conflictModalOpen}
        onClose={() => setConflictModalOpen(false)}
        conflictDescription={activeConflictDesc}
      />
    </div>
  );
};
