import {
  ScheduleEntry,
  Teacher,
  Subject,
  Room,
  ClassDivision,
  Conflict,
  QualityMetrics,
  DayOfWeek,
  InstitutionConfig,
} from '../types';

export interface MoveValidationResult {
  isValid: boolean;
  conflicts: Conflict[];
  warnings: string[];
  metrics: QualityMetrics;
  targetOccupiedBy?: ScheduleEntry;
}

export class TimetableValidator {
  /**
   * Purely checks for conflicts and warnings without calculating quality metrics (no recursion).
   */
  static checkConflicts(
    entry: ScheduleEntry,
    targetDay: DayOfWeek,
    targetPeriod: number,
    targetRoomId: string,
    allEntries: ScheduleEntry[],
    teachers: Teacher[],
    subjects: Subject[],
    rooms: Room[],
    divisions: ClassDivision[],
    config: InstitutionConfig
  ): { conflicts: Conflict[]; warnings: string[]; targetOccupiedBy?: ScheduleEntry } {
    const conflicts: Conflict[] = [];
    const warnings: string[] = [];

    // Filter out the moving entry from the active list during check
    const otherEntries = allEntries.filter((e) => e.id !== entry.id);

    const subject = subjects.find((s) => s.id === entry.subjectId);
    const teacher = teachers.find((t) => t.id === entry.teacherId);
    const room = rooms.find((r) => r.id === targetRoomId);

    // Check target occupation
    const targetOccupiedBy = otherEntries.find(
      (e) =>
        e.day === targetDay &&
        e.roomId === targetRoomId &&
        // Check overlap for span > 1
        Math.max(e.period, targetPeriod) < Math.min(e.period + e.span, targetPeriod + entry.span)
    );

    if (targetOccupiedBy) {
      conflicts.push({
        id: `room-collision-${entry.id}-${targetOccupiedBy.id}`,
        type: 'RoomConflict',
        entryIds: [entry.id, targetOccupiedBy.id],
        day: targetDay,
        period: targetPeriod,
        description: `Room ${room?.roomNumber || targetRoomId} is already occupied by ${
          subjects.find((s) => s.id === targetOccupiedBy.subjectId)?.name || 'another class'
        } at Period ${targetPeriod}.`,
        severity: 'hard',
      });
    }

    // 1. Teacher Conflict: Is the teacher teaching another class at this day and period?
    const teacherCollision = otherEntries.find(
      (e) =>
        e.teacherId === entry.teacherId &&
        e.day === targetDay &&
        Math.max(e.period, targetPeriod) < Math.min(e.period + e.span, targetPeriod + entry.span)
    );

    if (teacherCollision) {
      const collidingDivision = divisions.find((d) => d.id === teacherCollision.divisionId)?.name;
      conflicts.push({
        id: `teacher-collision-${entry.id}-${teacherCollision.id}`,
        type: 'TeacherConflict',
        entryIds: [entry.id, teacherCollision.id],
        day: targetDay,
        period: targetPeriod,
        description: `${teacher?.name || 'Assigned Teacher'} is already scheduled to teach ${
          collidingDivision || 'another division'
        } during Period ${targetPeriod} on ${targetDay}.`,
        severity: 'hard',
      });
    }

    // 2. Division Conflict: Is this class division already attending another subject right now?
    const divisionCollision = otherEntries.find(
      (e) =>
        e.divisionId === entry.divisionId &&
        e.day === targetDay &&
        Math.max(e.period, targetPeriod) < Math.min(e.period + e.span, targetPeriod + entry.span)
    );

    if (divisionCollision) {
      const collidingSub = subjects.find((s) => s.id === divisionCollision.subjectId)?.name;
      conflicts.push({
        id: `division-collision-${entry.id}-${divisionCollision.id}`,
        type: 'DivisionConflict',
        entryIds: [entry.id, divisionCollision.id],
        day: targetDay,
        period: targetPeriod,
        description: `This division is already scheduled for ${collidingSub} at Period ${targetPeriod}.`,
        severity: 'hard',
      });
    }

    // 3. Teacher Unavailable Days / Slots check
    if (teacher) {
      if ((teacher.unavailableDays || []).includes(targetDay)) {
        conflicts.push({
          id: `unavail-day-${entry.id}`,
          type: 'UnavailableSlotViolation',
          entryIds: [entry.id],
          day: targetDay,
          period: targetPeriod,
          description: `${teacher.name} has marked ${targetDay} as unavailable.`,
          severity: 'hard',
        });
      }
      for (let p = targetPeriod; p < targetPeriod + entry.span; p++) {
        const slotKey = `${targetDay}-P${p}`;
        if ((teacher.unavailableSlots || []).includes(slotKey)) {
          conflicts.push({
            id: `unavail-slot-${entry.id}-${p}`,
            type: 'UnavailableSlotViolation',
            entryIds: [entry.id],
            day: targetDay,
            period: p,
            description: `${teacher.name} is marked unavailable during ${targetDay} Period ${p}.`,
            severity: 'hard',
          });
        }
      }

      // Daily Limit Check
      const teacherEntriesToday = otherEntries.filter(
        (e) => e.teacherId === entry.teacherId && e.day === targetDay
      );
      const hoursToday = teacherEntriesToday.reduce((sum, e) => sum + e.span, 0) + entry.span;
      if (hoursToday > teacher.maxHoursPerDay) {
        conflicts.push({
          id: `daily-limit-${entry.id}`,
          type: 'DailyLimitExceeded',
          entryIds: [entry.id, ...teacherEntriesToday.map((e) => e.id)],
          day: targetDay,
          period: targetPeriod,
          description: `${teacher.name} would exceed daily limit (${hoursToday} hrs > ${teacher.maxHoursPerDay} hrs max).`,
          severity: 'hard',
        });
      }

      // Weekly Limit Check
      const teacherAllEntries = otherEntries.filter((e) => e.teacherId === entry.teacherId);
      const hoursWeek = teacherAllEntries.reduce((sum, e) => sum + e.span, 0) + entry.span;
      if (hoursWeek > teacher.maxHoursPerWeek) {
        conflicts.push({
          id: `weekly-limit-${entry.id}`,
          type: 'WeeklyLimitExceeded',
          entryIds: [entry.id],
          day: targetDay,
          period: targetPeriod,
          description: `${teacher.name} would exceed weekly limit (${hoursWeek} hrs > ${teacher.maxHoursPerWeek} hrs max).`,
          severity: 'hard',
        });
      }
    }

    // 4. Lab Requirements Check
    if (subject?.requiresLab || entry.span > 1) {
      if (room?.type !== 'Laboratory') {
        conflicts.push({
          id: `lab-req-${entry.id}`,
          type: 'ConsecutiveLabViolation',
          entryIds: [entry.id],
          day: targetDay,
          period: targetPeriod,
          description: `${subject?.name} requires a Laboratory, but ${room?.roomNumber || 'this room'} is a regular Classroom.`,
          severity: 'hard',
        });
      }
      // Check if lab spans across lunch break or beyond day boundaries
      if (targetPeriod + entry.span - 1 > config.timings.periodsPerDay) {
        conflicts.push({
          id: `span-boundary-${entry.id}`,
          type: 'ConsecutiveLabViolation',
          entryIds: [entry.id],
          day: targetDay,
          period: targetPeriod,
          description: `Practical session spans beyond the end of the day (Period ${targetPeriod + entry.span - 1} > ${config.timings.periodsPerDay}).`,
          severity: 'hard',
        });
      }
      if (
        targetPeriod <= config.timings.lunchAfterPeriod &&
        targetPeriod + entry.span - 1 > config.timings.lunchAfterPeriod
      ) {
        warnings.push(`Note: This ${entry.span}-period practical crosses the scheduled lunch break.`);
      }
    }

    // 5. Subject Distribution & Student Fatigue checks (Soft constraints)
    const sameSubjectToday = otherEntries.find(
      (e) => e.divisionId === entry.divisionId && e.subjectId === entry.subjectId && e.day === targetDay
    );
    if (sameSubjectToday) {
      warnings.push(`Warning: ${subject?.name || 'This subject'} is already scheduled earlier/later on ${targetDay}. Repeated sessions in one day may increase student fatigue.`);
    }

    return { conflicts, warnings, targetOccupiedBy };
  }

  /**
   * Validates moving a schedule entry to a new day/period/room, including simulated metrics.
   */
  static validateMove(
    entry: ScheduleEntry,
    targetDay: DayOfWeek,
    targetPeriod: number,
    targetRoomId: string,
    allEntries: ScheduleEntry[],
    teachers: Teacher[],
    subjects: Subject[],
    rooms: Room[],
    divisions: ClassDivision[],
    config: InstitutionConfig
  ): MoveValidationResult {
    const { conflicts, warnings, targetOccupiedBy } = TimetableValidator.checkConflicts(
      entry,
      targetDay,
      targetPeriod,
      targetRoomId,
      allEntries,
      teachers,
      subjects,
      rooms,
      divisions,
      config
    );

    const otherEntries = allEntries.filter((e) => e.id !== entry.id);
    const simulatedSchedule = [...otherEntries, { ...entry, day: targetDay, period: targetPeriod, roomId: targetRoomId }];
    const metrics = TimetableValidator.calculateQualityMetrics(
      simulatedSchedule,
      teachers,
      subjects,
      rooms,
      divisions,
      config
    );

    const hardConflicts = conflicts.filter((c) => c.severity === 'hard');

    return {
      isValid: hardConflicts.length === 0,
      conflicts,
      warnings,
      metrics,
      targetOccupiedBy,
    };
  }

  /**
   * Evaluates the full timetable and returns conflict list & quality breakdown.
   */
  static evaluateSchedule(
    allEntries: ScheduleEntry[],
    teachers: Teacher[],
    subjects: Subject[],
    rooms: Room[],
    divisions: ClassDivision[],
    config: InstitutionConfig
  ): { conflicts: Conflict[]; metrics: QualityMetrics } {
    const conflictsMap = new Map<string, Conflict>();

    for (const entry of allEntries) {
      const res = TimetableValidator.checkConflicts(
        entry,
        entry.day,
        entry.period,
        entry.roomId,
        allEntries,
        teachers,
        subjects,
        rooms,
        divisions,
        config
      );
      for (const c of res.conflicts) {
        conflictsMap.set(c.id, c);
      }
    }

    const conflicts = Array.from(conflictsMap.values());
    const metrics = TimetableValidator.calculateQualityMetrics(
      allEntries,
      teachers,
      subjects,
      rooms,
      divisions,
      config,
      conflicts
    );

    return { conflicts, metrics };
  }

  /**
   * Calculates comprehensive quality scores (0-100%).
   */
  static calculateQualityMetrics(
    entries: ScheduleEntry[],
    teachers: Teacher[],
    subjects: Subject[],
    rooms: Room[],
    divisions: ClassDivision[],
    config: InstitutionConfig,
    existingConflicts?: Conflict[]
  ): QualityMetrics {
    const conflicts =
      existingConflicts ||
      entries.flatMap((e) => {
        return TimetableValidator.checkConflicts(
          e,
          e.day,
          e.period,
          e.roomId,
          entries,
          teachers,
          subjects,
          rooms,
          divisions,
          config
        ).conflicts;
      });

    const hardCount = conflicts.filter((c) => c.severity === 'hard').length;
    // Each hard conflict drops conflictScore by 15 points, min 0
    const conflictScore = Math.max(0, Math.round(100 - hardCount * 15));

    // Teacher satisfaction based on workload balance & preferred time
    let satisfiedCounts = 0;
    let totalChecks = 0;
    for (const e of entries) {
      const t = teachers.find((t) => t.id === e.teacherId);
      if (t) {
        totalChecks++;
        if (t.preferredTime === 'Any') {
          satisfiedCounts++;
        } else if (t.preferredTime === 'Morning' && e.period <= config.timings.lunchAfterPeriod) {
          satisfiedCounts++;
        } else if (t.preferredTime === 'Afternoon' && e.period > config.timings.lunchAfterPeriod) {
          satisfiedCounts++;
        }
      }
    }
    const teacherSatisfaction = totalChecks > 0 ? Math.round((satisfiedCounts / totalChecks) * 100) : 100;

    // Room utilization
    const totalSlotsPerWeek = config.workingDays.length * config.timings.periodsPerDay * rooms.length;
    const totalFilledSlots = entries.reduce((sum, e) => sum + e.span, 0);
    const classroomUtilization = totalSlotsPerWeek > 0 ? Math.min(100, Math.round((totalFilledSlots / totalSlotsPerWeek) * 100)) : 80;

    // Lab utilization
    const labRooms = rooms.filter((r) => r.type === 'Laboratory');
    const totalLabSlotsPerWeek = config.workingDays.length * config.timings.periodsPerDay * Math.max(1, labRooms.length);
    const labEntries = entries.filter((e) => {
      const s = subjects.find((sub) => sub.id === e.subjectId);
      return s?.requiresLab || e.span > 1;
    });
    const totalFilledLabSlots = labEntries.reduce((sum, e) => sum + e.span, 0);
    const labUtilization =
      labRooms.length > 0 ? Math.min(100, Math.round((totalFilledLabSlots / totalLabSlotsPerWeek) * 100)) : 90;

    // Subject distribution (avoiding same subject 2x in same day for same division)
    let distributionScore = 100;
    for (const d of divisions) {
      for (const day of config.workingDays) {
        const daySubs = entries.filter((e) => e.divisionId === d.id && e.day === day).map((e) => e.subjectId);
        const uniqueSubs = new Set(daySubs);
        if (daySubs.length > uniqueSubs.size) {
          distributionScore -= Math.round((daySubs.length - uniqueSubs.size) * 8);
        }
      }
    }
    distributionScore = Math.max(0, distributionScore);

    // Overall weighted score
    const overallScore = Math.round(
      conflictScore * 0.45 +
        teacherSatisfaction * 0.15 +
        classroomUtilization * 0.15 +
        labUtilization * 0.1 +
        distributionScore * 0.15
    );

    return {
      conflictScore,
      teacherSatisfaction,
      classroomUtilization,
      labUtilization,
      subjectDistribution: distributionScore,
      overallScore,
    };
  }
}
