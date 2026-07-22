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
   * One-click repair: analyzes conflicts, preserves locked user edits, and re-routes colliding sessions cleanly.
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

    const initialHardConflicts = evalRes.conflicts.filter((c) => c.severity === 'hard');
    if (initialHardConflicts.length === 0) {
      return { repairedSchedule: currentSchedule, resolvedCount: 0 };
    }

    let resolvedCount = 0;

    // Iterate through conflicting unlocked entries and find valid slots
    for (const conflict of initialHardConflicts) {
      // Find the entries involved
      const involvedEntries = currentSchedule.filter(
        (e) => conflict.entryIds.includes(e.id) && !e.isLocked
      );

      for (const entryToFix of involvedEntries) {
        // Try to find an available clean slot across all days/periods/candidate rooms
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
                // Update schedule with the repaired entry
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

    return { repairedSchedule: currentSchedule, resolvedCount };
  }
}
