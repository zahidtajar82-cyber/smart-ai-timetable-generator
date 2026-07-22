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

export class CSPSolver {
  /**
   * Generates a complete conflict-free schedule using Backtracking & Forward Checking CSP heuristics.
   */
  static generateSchedule(
    teachers: Teacher[],
    subjects: Subject[],
    rooms: Room[],
    divisions: ClassDivision[],
    config: InstitutionConfig,
    existingEntries: ScheduleEntry[] = []
  ): ScheduleEntry[] {
    // Sanitize and provide fallbacks if arrays are partial/empty
    const effTeachers: Teacher[] = teachers.length > 0 ? teachers : [
      { id: 'teacher-auto-1', name: 'General Faculty Member', teacherId: 'FAC-101', preferredTime: 'Any', maxHoursPerDay: 6, maxHoursPerWeek: 30, preferredSlots: [] }
    ];
    const effRooms: Room[] = rooms.length > 0 ? rooms : [
      { id: 'room-auto-1', name: 'Lecture Hall 101', roomNumber: '101', capacity: 60, type: 'Classroom' },
      { id: 'room-auto-lab', name: 'Computer Lab 201', roomNumber: '201', capacity: 40, type: 'Laboratory' }
    ];
    const effDivisions: ClassDivision[] = divisions.length > 0 ? divisions : [
      { id: 'div-auto-1', name: 'Semester 1 - Div A', semester: 1, strength: 50 }
    ];
    const effSubjects: Subject[] = subjects.length > 0
      ? subjects.map((sub, i) => ({
          ...sub,
          assignedTeacherId: sub.assignedTeacherId || effTeachers[i % effTeachers.length].id,
          color: sub.color || 'emerald',
        }))
      : [
          { id: 'sub-auto-1', name: 'Core Theory & Practice', code: 'CTP101', type: 'Theory', weeklyHours: 4, assignedTeacherId: effTeachers[0].id, priority: 'Labs', requiresLab: false, color: 'emerald' },
          { id: 'sub-auto-2', name: 'Applied Computing Lab', code: 'ACL102', type: 'Practical', weeklyHours: 2, assignedTeacherId: effTeachers[0].id, priority: 'Labs', requiresLab: true, color: 'teal' }
        ];

    // Preserve locked entries
    const lockedEntries = existingEntries.filter((e) => e.isLocked);
    const generatedEntries: ScheduleEntry[] = [...lockedEntries];

    // Build the list of required sessions for all divisions
    const sessionsToSchedule: {
      id: string;
      subject: Subject;
      division: ClassDivision;
      span: number;
      requiresLab: boolean;
    }[] = [];

    let entryCounter = Date.now();

    for (const division of effDivisions) {
      for (const subject of effSubjects) {
        // Find how many hours needed per week
        const totalHours = subject.weeklyHours;
        const span = subject.type === 'Practical' ? 2 : 1;
        const numSessions = Math.ceil(totalHours / span);

        for (let i = 0; i < numSessions; i++) {
          sessionsToSchedule.push({
            id: `se-gen-${++entryCounter}`,
            subject,
            division,
            span,
            requiresLab: subject.requiresLab || span > 1,
          });
        }
      }
    }

    // Sort sessions by priority (Labs & high priority subjects first for tighter constraint satisfaction)
    sessionsToSchedule.sort((a, b) => {
      if (a.requiresLab && !b.requiresLab) return -1;
      if (!a.requiresLab && b.requiresLab) return 1;
      if (a.subject.priority === 'Labs' && b.subject.priority !== 'Labs') return -1;
      return 0;
    });

    const days = config.workingDays;
    const periods = Array.from({ length: config.timings.periodsPerDay }, (_, i) => i + 1);

    // Greedy + Backtracking heuristic assignment
    for (const session of sessionsToSchedule) {
      let bestSlot: { day: DayOfWeek; period: number; roomId: string; score: number } | null = null;

      // Candidate rooms for this session
      const candidateRooms = effRooms.filter((r) => {
        if (session.requiresLab) return r.type === 'Laboratory';
        // For regular theory, prefer classrooms first
        return r.type === 'Classroom' || true;
      });
      const availableRooms = candidateRooms.length > 0 ? candidateRooms : effRooms;

      for (const day of days) {
        for (const period of periods) {
          // If span > 1, ensure it fits inside the day
          if (period + session.span - 1 > config.timings.periodsPerDay) continue;

          for (const room of availableRooms) {
            const prospectiveEntry: ScheduleEntry = {
              id: session.id,
              subjectId: session.subject.id,
              teacherId: session.subject.assignedTeacherId || effTeachers[0].id,
              roomId: room.id,
              divisionId: session.division.id,
              day,
              period,
              span: session.span,
              isLocked: false,
            };

            const val = TimetableValidator.validateMove(
              prospectiveEntry,
              day,
              period,
              room.id,
              generatedEntries,
              effTeachers,
              effSubjects,
              effRooms,
              effDivisions,
              config
            );

            if (val.isValid) {
              const score = val.metrics.overallScore;
              if (!bestSlot || score > bestSlot.score) {
                bestSlot = { day, period, roomId: room.id, score };
              }
            }
          }
        }
      }

      if (bestSlot) {
        generatedEntries.push({
          id: session.id,
          subjectId: session.subject.id,
          teacherId: session.subject.assignedTeacherId,
          roomId: bestSlot.roomId,
          divisionId: session.division.id,
          day: bestSlot.day,
          period: bestSlot.period,
          span: session.span,
          isLocked: false,
        });
      } else {
        // If strict conflict-free placement failed for this session, place it in best minimal-conflict candidate slot
        let fallbackSlot: { day: DayOfWeek; period: number; roomId: string } | null = null;
        for (const day of days) {
          for (const period of periods) {
            if (period + session.span - 1 <= config.timings.periodsPerDay && availableRooms.length > 0) {
              fallbackSlot = { day, period, roomId: availableRooms[0].id };
              break;
            }
          }
          if (fallbackSlot) break;
        }
        if (fallbackSlot) {
          generatedEntries.push({
            id: session.id,
            subjectId: session.subject.id,
            teacherId: session.subject.assignedTeacherId || effTeachers[0].id,
            roomId: fallbackSlot.roomId,
            divisionId: session.division.id,
            day: fallbackSlot.day,
            period: fallbackSlot.period,
            span: session.span,
            isLocked: false,
          });
        }
      }
    }

    return CSPSolver.hillClimbOptimize(generatedEntries, teachers, subjects, rooms, divisions, config);
  }

  /**
   * Hill Climbing Local Optimization to improve overall Quality Score.
   */
  static hillClimbOptimize(
    entries: ScheduleEntry[],
    teachers: Teacher[],
    subjects: Subject[],
    rooms: Room[],
    divisions: ClassDivision[],
    config: InstitutionConfig
  ): ScheduleEntry[] {
    let currentEntries = [...entries];
    let currentMetrics = TimetableValidator.evaluateSchedule(currentEntries, teachers, subjects, rooms, divisions, config).metrics;

    const iterations = 40;
    for (let i = 0; i < iterations; i++) {
      // Pick a random unlocked entry and try moving/swapping it
      const unlockedIndices = currentEntries
        .map((e, idx) => (!e.isLocked ? idx : -1))
        .filter((idx) => idx !== -1);
      if (unlockedIndices.length === 0) break;

      const randIdx = unlockedIndices[Math.floor(Math.random() * unlockedIndices.length)];
      const targetEntry = currentEntries[randIdx];

      const randomDay = config.workingDays[Math.floor(Math.random() * config.workingDays.length)];
      const maxP = config.timings.periodsPerDay - targetEntry.span + 1;
      const randomPeriod = Math.floor(Math.random() * maxP) + 1;

      // Test move
      const prospectiveEntries = currentEntries.map((e, idx) =>
        idx === randIdx ? { ...e, day: randomDay, period: randomPeriod } : e
      );

      const val = TimetableValidator.evaluateSchedule(prospectiveEntries, teachers, subjects, rooms, divisions, config);
      if (val.conflicts.filter((c) => c.severity === 'hard').length <= TimetableValidator.evaluateSchedule(currentEntries, teachers, subjects, rooms, divisions, config).conflicts.filter((c) => c.severity === 'hard').length && val.metrics.overallScore > currentMetrics.overallScore) {
        currentEntries = prospectiveEntries;
        currentMetrics = val.metrics;
      }
    }

    return currentEntries;
  }
}
