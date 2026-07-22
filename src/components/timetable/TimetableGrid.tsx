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
  Layers,
  ChevronDown,
  CalendarDays,
  TableProperties,
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
  const [mobileLayout, setMobileLayout] = useState<'table' | 'cards'>('table');

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
    <div className="space-y-6 w-full min-w-0">
      {/* Top Filter & Control Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
              Academic Timetable Grid
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Drag and drop cards to adjust schedule. All constraints validated instantly in real time.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto justify-between lg:justify-end">
          {/* Mobile Layout Mode Toggle (Table vs Day Cards) */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl sm:hidden shrink-0">
            <button
              onClick={() => setMobileLayout('table')}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mobileLayout === 'table'
                  ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setMobileLayout('cards')}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mobileLayout === 'cards'
                  ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setViewMode('single')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'single'
                  ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              Single Division
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'all'
                  ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
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
                className="appearance-none pl-4 pr-9 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {divisions.map((d) => (
                  <option key={d.id} value={d.id} className="bg-zinc-900 text-white">
                    {d.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}
        </div>
      </div>

      {/* Grid Layouts for Displayed Divisions */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="space-y-10 w-full min-w-0">
          {displayedDivisions.map((division) => {
            if (!division) return null;

            return (
              <div
                key={division.id}
                className="bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xs w-full min-w-0"
              >
                <div className="flex flex-wrap items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-800/60 pb-3 gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <h3 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-white">
                      {division.name}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold">
                      {division.strength} Students
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 font-semibold hidden sm:block">
                    {config.workingDays.length} Days | {config.timings.periodsPerDay} Periods per Day
                  </div>
                </div>

                {/* Desktop & Table Grid Mode (Horizontally Scrollable Container) */}
                <div className={`w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 ${mobileLayout === 'cards' ? 'hidden sm:block' : 'block'}`}>
                  <div className="min-w-[780px] grid grid-cols-[110px_1fr] gap-3">
                    {/* Column 1: Day Labels Column Header */}
                    <div className="font-bold text-xs text-zinc-400 uppercase tracking-wider p-2 flex items-center">
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
                          <div className="p-2.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/60 text-center">
                            <div className="text-xs font-black text-zinc-800 dark:text-zinc-200">
                              Period {p}
                            </div>
                            <div className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">
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
                          <div className="flex items-center p-3 rounded-2xl bg-zinc-100/60 dark:bg-zinc-800/40 font-black text-xs sm:text-sm text-zinc-800 dark:text-zinc-200">
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
                                    className="rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-dashed border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 italic p-2"
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

                {/* Mobile Day-by-Day Cards View (Rendered when mobileLayout === 'cards' on small screens) */}
                <div className={`space-y-6 sm:hidden ${mobileLayout === 'cards' ? 'block' : 'hidden'}`}>
                  {config.workingDays.map((day) => {
                    const divisionEntries = schedule.filter(
                      (e) => e.divisionId === division.id && e.day === day
                    );

                    return (
                      <div key={`${division.id}-${day}-card`} className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 border border-zinc-200/80 dark:border-zinc-700/80 space-y-3">
                        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 pb-2">
                          <span className="font-black text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            {day}
                          </span>
                          <span className="text-[11px] font-bold text-zinc-500">
                            {divisionEntries.length} Classes
                          </span>
                        </div>

                        <div className="space-y-2">
                          {periods.map((p) => {
                            const coveredByLab = divisionEntries.find(
                              (e) => e.period < p && e.period + e.span > p
                            );
                            if (coveredByLab) return null;

                            const slotEntries = divisionEntries.filter((e) => e.period === p);

                            return (
                              <div key={`${day}-${p}-card-slot`} className="space-y-1">
                                <div className="flex items-center justify-between text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400 px-1">
                                  <span>Period {p}</span>
                                  <span>{getPeriodTimeString(p)}</span>
                                </div>
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
                                {p === config.timings.lunchAfterPeriod && (
                                  <div className="py-2 px-3 my-1 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 text-center text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center justify-center gap-1.5">
                                    <Utensils className="w-3.5 h-3.5" />
                                    <span>Lunch Break</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
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
