export type UserRole = 'admin' | 'teacher' | 'student';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface InstitutionConfig {
  collegeName: string;
  academicYear: string;
  semester: string;
  department: string;
  course: string;
  workingDays: DayOfWeek[];
  timings: {
    startTime: string; // e.g., '09:00'
    endTime: string;   // e.g., '16:00'
    periodsPerDay: number; // e.g., 6
    periodDurationMinutes: number; // e.g., 50
    lunchAfterPeriod: number; // e.g., 3 (lunch is after period 3)
    lunchDurationMinutes: number; // e.g., 50
  };
}

export interface Teacher {
  id: string;
  name: string;
  teacherId: string;
  preferredTime: 'Morning' | 'Afternoon' | 'Any';
  maxHoursPerDay: number;
  maxHoursPerWeek: number;
  unavailableDays?: DayOfWeek[];
  unavailableSlots?: string[]; // Format: "${day}-P${period}", e.g., "Monday-P1"
  avatar?: string;
  department?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  weeklyHours: number;
  hoursPerWeek?: number;
  type: 'Theory' | 'Practical' | 'Tutorial';
  priority?: 'Labs' | 'Core' | 'Electives' | 'Sports' | 'Library' | 'Activities' | 'high' | 'normal' | 'low';
  assignedTeacherId: string;
  requiresLab: boolean;
  requiredEquipment?: string[];
  color: string; // Hex or Tailwind class for vibrant styling
}

export interface Room {
  id: string;
  roomNumber: string;
  capacity: number;
  type: 'Classroom' | 'Laboratory';
  availableEquipment?: string[];
}

export interface ClassDivision {
  id: string;
  name: string;      // e.g., "Sem 5 - Div A"
  semester: number;
  strength: number;
  defaultRoomId?: string;
}

export type Division = ClassDivision;

export interface ScheduleEntry {
  id: string;
  subjectId: string;
  teacherId: string;
  roomId: string;
  divisionId: string;
  day: DayOfWeek;
  period: number;      // 1-indexed (1 to periodsPerDay)
  span: number;        // 1 for Theory, 2 for consecutive Lab periods
  isLocked: boolean;   // True if manually pinned by user
  notes?: string;
}

export type ConflictType =
  | 'TeacherConflict'
  | 'RoomConflict'
  | 'DivisionConflict'
  | 'DailyLimitExceeded'
  | 'WeeklyLimitExceeded'
  | 'ConsecutiveLabViolation'
  | 'UnavailableSlotViolation';

export interface Conflict {
  id: string;
  type: ConflictType;
  entryIds: string[];  // IDs of ScheduleEntry items involved in this conflict
  day: DayOfWeek;
  period: number;
  description: string;
  severity: 'hard' | 'soft';
}

export interface QualityMetrics {
  conflictScore: number;         // 0 to 100 (100 = zero hard conflicts)
  teacherSatisfaction: number;   // 0 to 100 based on preferred times & workload balance
  classroomUtilization: number;  // 0 to 100 percentage of room slots filled cleanly
  labUtilization: number;        // 0 to 100 percentage of lab slots used for practicals
  subjectDistribution: number;   // 0 to 100 score avoiding same subject twice in a day
  overallScore: number;          // Weighted composite score (0 to 100)
}

export interface VersionHistoryItem {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  schedule: ScheduleEntry[];
  metrics: QualityMetrics;
}

export interface AISuggestion {
  id: string;
  type: 'optimization' | 'conflict_warning' | 'workload_alert' | 'spacing_tip';
  title: string;
  description: string;
  impact: string; // e.g., "+5% Quality Score" or "Resolves 2 conflicts"
  actionable: boolean;
  targetIds?: string[];
  suggestedAction?: () => void;
}
