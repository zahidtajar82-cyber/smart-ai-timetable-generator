'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { DayOfWeek, ScheduleEntry, Subject, Teacher, Room, UserRole } from '@/lib/types';
import { useTimetableStore } from '@/store/useTimetableStore';
import { ClassCard } from './ClassCard';
import { Plus } from 'lucide-react';

interface DroppableSlotProps {
  day: DayOfWeek;
  period: number;
  entries: ScheduleEntry[];
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
  currentRole: UserRole;
  conflictsMap: Map<string, string>;
  onOpenConflictDialog: (conflictDesc: string) => void;
  onQuickAdd?: (day: DayOfWeek, period: number) => void;
}

export const DroppableSlot: React.FC<DroppableSlotProps> = ({
  day,
  period,
  entries,
  subjects,
  teachers,
  rooms,
  currentRole,
  conflictsMap,
  onOpenConflictDialog,
  onQuickAdd,
}) => {
  const { openQuickAddSlot } = useTimetableStore();
  const slotId = `slot-${day}-${period}`;
  const { isOver, setNodeRef } = useDroppable({
    id: slotId,
    data: { day, period },
  });

  const isAdmin = currentRole === 'admin';

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[115px] sm:min-h-[130px] rounded-2xl p-1.5 transition-all duration-200 flex flex-col justify-between border ${
        isOver
          ? 'bg-indigo-50/90 dark:bg-indigo-950/40 border-2 border-indigo-500 shadow-inner scale-[1.01]'
          : entries.length > 0
          ? 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800'
          : 'bg-white/40 dark:bg-slate-900/20 border-dashed border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {entries.length > 0 ? (
        <div className="space-y-1.5 flex-1 flex flex-col justify-between">
          {entries.map((entry) => {
            const sub = subjects.find((s) => s.id === entry.subjectId);
            const tea = teachers.find((t) => t.id === entry.teacherId);
            const rm = rooms.find((r) => r.id === entry.roomId);
            const conflictDesc = conflictsMap.get(entry.id);

            return (
              <ClassCard
                key={entry.id}
                entry={entry}
                subject={sub}
                teacher={tea}
                room={rm}
                currentRole={currentRole}
                isConflict={!!conflictDesc}
                conflictDescription={conflictDesc}
                onOpenConflictDialog={() => conflictDesc && onOpenConflictDialog(conflictDesc)}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center group">
          {isAdmin ? (
            <button
              onClick={() => {
                if (onQuickAdd) onQuickAdd(day, period);
                else openQuickAddSlot(day, period);
              }}
              className="w-full h-full rounded-xl border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800 flex items-center justify-center text-slate-300 dark:text-slate-700 hover:text-indigo-500 transition-all opacity-0 group-hover:opacity-100"
              title={`Add session to ${day} Period ${period}`}
            >
              <Plus className="w-5 h-5" />
            </button>
          ) : (
            <span className="text-xs text-slate-300 dark:text-slate-700 font-medium italic">Free Slot</span>
          )}
        </div>
      )}
    </div>
  );
};
