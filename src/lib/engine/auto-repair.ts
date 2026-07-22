import {
  ScheduleEntry,
  Teacher,
  Subject,
  Room,
  ClassDivision,
  InstitutionConfig,
  DayOfWeek,
} from '../types';
import { TimetableValidator } from './validator';

export class AutoRepairEngine {
  /**
   * Comprehensive auto-repair: resolves hard conflicts, separates stacked cards, and optimizes slot assignment while preserving locked user edits.
   */
  static repairConflicts(
    entries: ScheduleEntry[],
    teachers: Teacher[],
    subjects: Subject[],
    rooms: Room[],
    divisions: ClassDivision[],
    config: InstitutionConfig
  ): { repairedSchedule: ScheduleEntry[]; resolvedCount: number } {
    let currentSchedule = [...entries];
    let evalRes = TimetableValidator.evaluateSchedule(
      currentSchedule,
      teachers,
      subjects,
      rooms,
      divisions,
      config
    );

    let resolvedCount = 0;

    // PASS 1: Strict clean relocation for entries involved in hard conflicts
    let initialHardConflicts = evalRes.conflicts.filter((c) => c.severity === 'hard');
    for (const conflict of initialHardConflicts) {
      const involvedEntries = currentSchedule.filter(
        (e) => conflict.entryIds.includes(e.id) && !e.isLocked
      );

      for (const entryToFix of involvedEntries) {
        let fixed = false;
        const candidateRooms = rooms.filter((r) => {
          const sub = subjects.find((s) => s.id === entryToFix.subjectId);
          if (sub?.requiresLab || entryToFix.span > 1) return r.type === 'Laboratory';
          return true;
        });

        for (const day of config.workingDays) {
          if (fixed) break;
          for (let period = 1; period <= config.timings.periodsPerDay - entryToFix.span + 1; period++) {
            if (fixed) break;
            for (const room of candidateRooms) {
              const prospectiveMove: ScheduleEntry = {
                ...entryToFix,
                day,
                period,
                roomId: room.id,
              };

              const moveCheck = TimetableValidator.validateMove(
                prospectiveMove,
                day,
                period,
                room.id,
                currentSchedule,
                teachers,
                subjects,
                rooms,
                divisions,
                config
              );

              if (moveCheck.isValid) {
                currentSchedule = currentSchedule.map((e) =>
                  e.id === entryToFix.id ? prospectiveMove : e
                );
                fixed = true;
                resolvedCount++;
                break;
              }
            }
          }
        }
      }
    }

    // PASS 2: De-stacking & minimal-conflict relocation for stacked or remaining conflicting classes
    for (let pass = 0; pass < 2; pass++) {
      evalRes = TimetableValidator.evaluateSchedule(currentSchedule, teachers, subjects, rooms, divisions, config);
      const currentHardCount = evalRes.conflicts.filter((c) => c.severity === 'hard').length;

      // Find stacked entries (2 or more classes for same division in exact same day & period)
      const stackedEntries: ScheduleEntry[] = [];
      const divisionSlotMap = new Map<string, ScheduleEntry[]>();
      for (const e of currentSchedule) {
        const key = `${e.divisionId}-${e.day}-${e.period}`;
        if (!divisionSlotMap.has(key)) divisionSlotMap.set(key, []);
        divisionSlotMap.get(key)!.push(e);
      }
      for (const [, group] of divisionSlotMap) {
        if (group.length > 1) {
          // Push unlocked entries after the first one to be de-stacked
          group.slice(1).forEach((e) => {
            if (!e.isLocked && !stackedEntries.some((se) => se.id === e.id)) stackedEntries.push(e);
          });
        }
      }

      const conflictingIds = new Set<string>();
      evalRes.conflicts.filter((c) => c.severity === 'hard').forEach((c) => {
        c.entryIds.forEach((id) => conflictingIds.add(id));
      });

      const targetsToOptimize = currentSchedule.filter(
        (e) => !e.isLocked && (conflictingIds.has(e.id) || stackedEntries.some((se) => se.id === e.id))
      );

      if (targetsToOptimize.length === 0) break;

      for (const entryToFix of targetsToOptimize) {
        let bestCandidate: { day: DayOfWeek; period: number; roomId: string; conflicts: number; score: number } | null = null;
        const candidateRooms = rooms.filter((r) => {
          const sub = subjects.find((s) => s.id === entryToFix.subjectId);
          if (sub?.requiresLab || entryToFix.span > 1) return r.type === 'Laboratory';
          return true;
        });

        for (const day of config.workingDays) {
          for (let period = 1; period <= config.timings.periodsPerDay - entryToFix.span + 1; period++) {
            // Avoid moving into another slot that already has a class for the same division
            const divisionBusy = currentSchedule.some(
              (e) => e.id !== entryToFix.id && e.divisionId === entryToFix.divisionId && e.day === day && e.period === period
            );
            if (divisionBusy) continue;

            for (const room of candidateRooms) {
              const prospectiveMove: ScheduleEntry = {
                ...entryToFix,
                day,
                period,
                roomId: room.id,
              };
              const moveCheck = TimetableValidator.validateMove(
                prospectiveMove,
                day,
                period,
                room.id,
                currentSchedule,
                teachers,
                subjects,
                rooms,
                divisions,
                config
              );
              const confCount = moveCheck.conflicts.filter((c) => c.severity === 'hard').length;
              if (
                bestCandidate === null ||
                confCount < bestCandidate.conflicts ||
                (confCount === bestCandidate.conflicts && moveCheck.metrics.overallScore > bestCandidate.score)
              ) {
                bestCandidate = { day, period, roomId: room.id, conflicts: confCount, score: moveCheck.metrics.overallScore };
              }
            }
          }
        }

        if (bestCandidate && (bestCandidate.conflicts < currentHardCount || stackedEntries.some((se) => se.id === entryToFix.id))) {
          const moveDay = bestCandidate.day;
          const movePeriod = bestCandidate.period;
          const moveRoom = bestCandidate.roomId;
          currentSchedule = currentSchedule.map((e) =>
            e.id === entryToFix.id ? { ...e, day: moveDay, period: movePeriod, roomId: moveRoom } : e
          );
          resolvedCount++;
        }
      }
    }

    return { repairedSchedule: currentSchedule, resolvedCount };
  }
}
