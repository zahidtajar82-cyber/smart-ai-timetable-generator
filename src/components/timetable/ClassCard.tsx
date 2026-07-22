'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ScheduleEntry, Subject, Teacher, Room, UserRole } from '@/lib/types';
import { useTimetableStore } from '@/store/useTimetableStore';
import {
  Lock,
  Unlock,
  AlertTriangle,
  User,
  MapPin,
  Beaker,
  Trash2,
} from 'lucide-react';

interface ClassCardProps {
  entry: ScheduleEntry;
  subject?: Subject;
  teacher?: Teacher;
  room?: Room;
  currentRole: UserRole;
  isConflict?: boolean;
  conflictDescription?: string;
  onOpenConflictDialog?: () => void;
  isOverlay?: boolean;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  entry,
  subject,
  teacher,
  room,
  currentRole,
  isConflict,
  conflictDescription,
  onOpenConflictDialog,
  isOverlay,
}) => {
  const { toggleLockEntry, deleteEntry } = useTimetableStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: entry.id,
    data: {
      day: entry.day,
      period: entry.period,
      entryId: entry.id,
      divisionId: entry.divisionId,
      type: 'ClassCard',
    },
    disabled: isOverlay || currentRole !== 'admin' || entry.isLocked,
  });

  const style = isOverlay
    ? { zIndex: 100 }
    : {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 1,
      };

  const isAdmin = currentRole === 'admin';
  const color = subject?.color || '#10b981';

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      {...(isOverlay ? {} : attributes)}
      {...(isOverlay ? {} : listeners)}
      className={`group relative rounded-xl p-2.5 sm:p-3 border transition-all duration-200 select-none ${
        isDragging
          ? 'opacity-80 scale-105 shadow-2xl ring-2 ring-emerald-500 bg-white dark:bg-zinc-800 cursor-grabbing'
          : isConflict
          ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 shadow-xs hover:shadow-md cursor-grab'
          : 'bg-white/90 dark:bg-zinc-800/90 border-zinc-200/80 dark:border-zinc-700/80 shadow-xs hover:shadow-md hover:border-emerald-400 dark:hover:border-emerald-600 cursor-grab'
      } ${entry.isLocked ? 'ring-1 ring-amber-400 dark:ring-amber-500/60' : ''}`}
    >
      {/* Top Color Accent Strip */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
        style={{ backgroundColor: color }}
      />

      {/* Header: Subject Code & Status Icons */}
      <div className="flex items-center justify-between mb-1 pt-0.5">
        <span className="text-[11px] font-extrabold tracking-wider uppercase px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700/80 text-zinc-700 dark:text-zinc-300">
          {subject?.code || 'SUB'}
        </span>

        <div className="flex items-center space-x-1">
          {/* Conflict Badge */}
          {isConflict && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenConflictDialog?.();
              }}
              className="p-1 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 hover:bg-rose-200 transition-colors animate-pulse"
              title={conflictDescription || 'Conflict Detected'}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Practical/Lab Indicator */}
          {entry.span > 1 && (
            <span
              className="p-1 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 font-bold text-[10px] flex items-center"
              title="2-Period Practical Session"
            >
              <Beaker className="w-3 h-3 mr-0.5" />
              2P
            </span>
          )}

          {/* Lock/Pin Controls (Admin only) */}
          {isAdmin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLockEntry(entry.id);
              }}
              className={`p-1 rounded transition-colors ${
                entry.isLocked
                  ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300'
                  : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 opacity-0 group-hover:opacity-100'
              }`}
              title={entry.isLocked ? 'Pinned (AI will not move)' : 'Pin entry against AI shifts'}
            >
              {entry.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            </button>
          )}

          {/* Delete action */}
          {isAdmin && !entry.isLocked && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteEntry(entry.id);
              }}
              className="p-1 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 opacity-0 group-hover:opacity-100 transition-all"
              title="Remove session from timetable"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Subject Name */}
      <div className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white leading-tight mb-2 line-clamp-2">
        {subject?.name || 'Class Session'}
      </div>

      {/* Footer Details: Teacher & Room */}
      <div className="space-y-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
        <div className="flex items-center space-x-1.5 truncate">
          <User className="w-3 h-3 text-zinc-400 shrink-0" />
          <span className="truncate">{teacher?.name || 'Unassigned'}</span>
        </div>
        <div className="flex items-center space-x-1.5 truncate">
          <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
          <span className="truncate font-semibold text-zinc-700 dark:text-zinc-300">
            {room?.roomNumber || 'Room N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};
