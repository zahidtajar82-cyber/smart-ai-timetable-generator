import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  UserRole,
  InstitutionConfig,
  Teacher,
  Subject,
  Room,
  ClassDivision,
  ScheduleEntry,
  Conflict,
  QualityMetrics,
  VersionHistoryItem,
  AISuggestion,
  DayOfWeek,
} from '../lib/types';
import {
  initialInstitutionConfig,
  initialTeachers,
  initialSubjects,
  initialRooms,
  initialDivisions,
  initialScheduleEntries,
} from '../lib/mock-data';
import { TimetableValidator, MoveValidationResult } from '../lib/engine/validator';
import { CSPSolver } from '../lib/engine/csp-solver';
import { AutoRepairEngine } from '../lib/engine/auto-repair';

interface TimetableState {
  // Auth & Onboarding State
  isAuthenticated: boolean;
  hasSeenIntro: boolean;
  currentUser: { role: UserRole; name: string; identifier: string } | null;
  login: (role: UserRole, identifier: string, password?: string) => void;
  logout: () => void;
  finishIntro: () => void;
  loadSampleData: () => void;
  clearAllData: () => void;

  // Current Role
  currentRole: UserRole;
  setRole: (role: UserRole) => void;

  // Institutional Data
  config: InstitutionConfig;
  teachers: Teacher[];
  subjects: Subject[];
  rooms: Room[];
  divisions: ClassDivision[];

  // Active Schedule & Evaluation
  schedule: ScheduleEntry[];
  selectedDivisionId: string;
  setSelectedDivisionId: (id: string) => void;
  conflicts: Conflict[];
  metrics: QualityMetrics;

  // Version History (Undo / Redo / Checkpoints)
  history: VersionHistoryItem[];
  historyIndex: number;
  undo: () => void;
  redo: () => void;
  saveVersion: (title: string, description: string) => void;
  restoreVersion: (index: number) => void;

  // Actions & Drag & Drop
  moveEntry: (entryId: string, targetDay: DayOfWeek, targetPeriod: number, targetRoomId?: string, targetEntryId?: string) => MoveValidationResult;
  addEntry: (entry: ScheduleEntry) => void;
  activeQuickAddSlot: { day: DayOfWeek; period: number } | null;
  openQuickAddSlot: (day: DayOfWeek, period: number) => void;
  closeQuickAddSlot: () => void;
  toggleLockEntry: (entryId: string) => void;
  deleteEntry: (entryId: string) => void;

  // AI Engines
  isGenerating: boolean;
  generateSchedule: () => void;
  generateTimetable: () => Promise<void>;
  autoRepair: () => number;
  suggestions: AISuggestion[];
  generateSuggestions: () => void;

  // CRUD for Admin Management
  updateConfig: (newConfig: Partial<InstitutionConfig>) => void;
  addTeacher: (teacher: Teacher) => void;
  updateTeacher: (id: string, updated: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;
  addSubject: (subject: Subject) => void;
  updateSubject: (id: string, updated: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  addRoom: (room: Room) => void;
  updateRoom: (id: string, updated: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  addDivision: (division: ClassDivision) => void;
  updateDivision: (id: string, updated: Partial<ClassDivision>) => void;
  deleteDivision: (id: string) => void;
}

export const useTimetableStore = create<TimetableState>()(
  persist(
    (set, get) => {
      const defaultMetrics: QualityMetrics = {
        conflictScore: 100,
        teacherSatisfaction: 100,
        classroomUtilization: 100,
        labUtilization: 100,
        subjectDistribution: 100,
        overallScore: 100,
      };

      const initialEval = TimetableValidator.evaluateSchedule(
        initialScheduleEntries,
        initialTeachers,
        initialSubjects,
        initialRooms,
        initialDivisions,
        initialInstitutionConfig
      );

      return {
    // Auth & Onboarding defaults
    isAuthenticated: false,
    hasSeenIntro: false,
    currentUser: null,

    login: (role, identifier, password) => {
      set({
        isAuthenticated: true,
        currentRole: role,
        currentUser: {
          role,
          identifier,
          name: role === 'admin' ? 'System Administrator' : role === 'teacher' ? `Dr. ${identifier}` : `Student (${identifier})`,
        },
      });
    },

    logout: () => {
      set({
        isAuthenticated: false,
        currentUser: null,
      });
    },

    finishIntro: () => {
      set({ hasSeenIntro: true });
    },

    loadSampleData: () => {
      const evalRes = TimetableValidator.evaluateSchedule(
        initialScheduleEntries,
        initialTeachers,
        initialSubjects,
        initialRooms,
        initialDivisions,
        initialInstitutionConfig
      );
      set({
        config: initialInstitutionConfig,
        teachers: initialTeachers,
        subjects: initialSubjects,
        rooms: initialRooms,
        divisions: initialDivisions,
        schedule: initialScheduleEntries,
        selectedDivisionId: initialDivisions[0]?.id || '',
        conflicts: evalRes.conflicts,
        metrics: evalRes.metrics,
        history: [
          {
            id: `ver-sample-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            title: 'Sample Schedule Loaded',
            description: 'Loaded sample CSE department faculty and pre-generated timetable.',
            schedule: initialScheduleEntries,
            metrics: evalRes.metrics,
          },
        ],
        historyIndex: 0,
      });
    },

    clearAllData: () => {
      set({
        teachers: [],
        subjects: [],
        rooms: [],
        divisions: [],
        schedule: [],
        conflicts: [],
        metrics: defaultMetrics,
        history: [],
        historyIndex: 0,
      });
    },

    currentRole: 'admin',
    setRole: (role) => set({ currentRole: role }),

    config: initialInstitutionConfig,
    teachers: initialTeachers,
    subjects: initialSubjects,
    rooms: initialRooms,
    divisions: initialDivisions,

    schedule: initialScheduleEntries,
    selectedDivisionId: initialDivisions[0]?.id || '',
    setSelectedDivisionId: (id) => set({ selectedDivisionId: id }),
    conflicts: initialEval.conflicts,
    metrics: initialEval.metrics,

    history: [
      {
        id: `ver-init`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: 'Initial Schedule',
        description: 'Pre-generated optimal timetable.',
        schedule: initialScheduleEntries,
        metrics: initialEval.metrics,
      },
    ],
    historyIndex: 0,

    undo: () => {
      const { historyIndex, history, teachers, subjects, rooms, divisions, config } = get();
      if (historyIndex > 0) {
        const prevIndex = historyIndex - 1;
        const prevSchedule = history[prevIndex].schedule;
        const evalRes = TimetableValidator.evaluateSchedule(prevSchedule, teachers, subjects, rooms, divisions, config);
        set({
          schedule: prevSchedule,
          historyIndex: prevIndex,
          conflicts: evalRes.conflicts,
          metrics: evalRes.metrics,
        });
      }
    },

    redo: () => {
      const { historyIndex, history, teachers, subjects, rooms, divisions, config } = get();
      if (historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1;
        const nextSchedule = history[nextIndex].schedule;
        const evalRes = TimetableValidator.evaluateSchedule(nextSchedule, teachers, subjects, rooms, divisions, config);
        set({
          schedule: nextSchedule,
          historyIndex: nextIndex,
          conflicts: evalRes.conflicts,
          metrics: evalRes.metrics,
        });
      }
    },

    saveVersion: (title, description) => {
      const { schedule, metrics, history, historyIndex } = get();
      const newVersion: VersionHistoryItem = {
        id: `ver-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title,
        description,
        schedule: [...schedule],
        metrics: { ...metrics },
      };
      const newHistory = history.slice(0, historyIndex + 1).concat(newVersion);
      set({ history: newHistory, historyIndex: newHistory.length - 1 });
    },

    restoreVersion: (index) => {
      const { history, teachers, subjects, rooms, divisions, config } = get();
      if (index >= 0 && index < history.length) {
        const targetSchedule = history[index].schedule;
        const evalRes = TimetableValidator.evaluateSchedule(targetSchedule, teachers, subjects, rooms, divisions, config);
        set({
          schedule: targetSchedule,
          historyIndex: index,
          conflicts: evalRes.conflicts,
          metrics: evalRes.metrics,
        });
      }
    },

    moveEntry: (entryId, targetDay, targetPeriod, targetRoomId, targetEntryId) => {
      const { schedule, teachers, subjects, rooms, divisions, config, saveVersion } = get();
      const entry = schedule.find((e) => e.id === entryId);
      if (!entry) {
        return {
          isValid: false,
          conflicts: [],
          warnings: ['Entry not found'],
          metrics: get().metrics,
        };
      }

      const oldDay = entry.day;
      const oldPeriod = entry.period;
      const oldRoomId = entry.roomId;

      // Check if we are dropping onto an existing entry at targetDay/targetPeriod for the same division OR if targetEntryId is explicitly provided
      const existingEntryAtTarget = schedule.find(
        (e) => e.id !== entryId && (e.id === targetEntryId || (e.divisionId === entry.divisionId && e.day === targetDay && e.period === targetPeriod))
      );

      let updatedSchedule: ScheduleEntry[];
      let actionDesc = '';
      const roomIdToUse = targetRoomId || entry.roomId;

      if (existingEntryAtTarget) {
        // SWAP / EXCHANGE CLASS 1 AND CLASS 2
        // Class 1 (entry) takes Class 2's slot (targetDay, targetPeriod, targetRoomId)
        // Class 2 (existingEntryAtTarget) takes Class 1's old slot (oldDay, oldPeriod, oldRoomId)
        updatedSchedule = schedule.map((e) => {
          if (e.id === entryId) {
            return {
              ...e,
              day: targetDay,
              period: targetPeriod,
              roomId: targetRoomId || existingEntryAtTarget.roomId || e.roomId,
            };
          }
          if (e.id === existingEntryAtTarget.id) {
            return {
              ...e,
              day: oldDay,
              period: oldPeriod,
              roomId: oldRoomId || e.roomId,
            };
          }
          return e;
        });

        const sub1 = subjects.find((s) => s.id === entry.subjectId)?.name || 'Class 1';
        const sub2 = subjects.find((s) => s.id === existingEntryAtTarget.subjectId)?.name || 'Class 2';
        actionDesc = `Exchanged ${sub1} and ${sub2}`;
      } else {
        // MOVE TO EMPTY SLOT
        updatedSchedule = schedule.map((e) =>
          e.id === entryId ? { ...e, day: targetDay, period: targetPeriod, roomId: roomIdToUse } : e
        );
        const subName = subjects.find((s) => s.id === entry.subjectId)?.name || 'Class';
        actionDesc = `Moved ${subName} to ${targetDay} Period ${targetPeriod}`;
      }

      const targetRoomForValidation = targetRoomId || (existingEntryAtTarget ? existingEntryAtTarget.roomId : entry.roomId);
      const scheduleForValidation = existingEntryAtTarget
        ? schedule.filter((e) => e.id !== existingEntryAtTarget.id)
        : schedule;
      const validation = TimetableValidator.validateMove(
        { ...entry, day: targetDay, period: targetPeriod, roomId: targetRoomForValidation },
        targetDay,
        targetPeriod,
        targetRoomForValidation,
        scheduleForValidation,
        teachers,
        subjects,
        rooms,
        divisions,
        config
      );

      const fullEval = TimetableValidator.evaluateSchedule(updatedSchedule, teachers, subjects, rooms, divisions, config);
      set({
        schedule: updatedSchedule,
        conflicts: fullEval.conflicts,
        metrics: fullEval.metrics,
      });

      saveVersion(actionDesc, existingEntryAtTarget ? `Swapped positions between two sessions` : `Moved to empty slot ${targetDay} Period ${targetPeriod}`);
      get().generateSuggestions();

      return validation;
    },

    addEntry: (entry) => {
      const { schedule, teachers, subjects, rooms, divisions, config, saveVersion } = get();
      const updated = [...schedule, entry];
      const evalRes = TimetableValidator.evaluateSchedule(updated, teachers, subjects, rooms, divisions, config);
      set({ schedule: updated, conflicts: evalRes.conflicts, metrics: evalRes.metrics });
      const subName = subjects.find((s) => s.id === entry.subjectId)?.name || 'Class Session';
      saveVersion(`Added ${subName}`, `Manually scheduled at ${entry.day} Period ${entry.period}`);
      get().generateSuggestions();
    },

    activeQuickAddSlot: null,
    openQuickAddSlot: (day, period) => set({ activeQuickAddSlot: { day, period } }),
    closeQuickAddSlot: () => set({ activeQuickAddSlot: null }),

    toggleLockEntry: (entryId) => {
      const { schedule, saveVersion } = get();
      const updated = schedule.map((e) => (e.id === entryId ? { ...e, isLocked: !e.isLocked } : e));
      set({ schedule: updated });
      const entry = updated.find((e) => e.id === entryId);
      saveVersion(
        entry?.isLocked ? 'Pinned Session' : 'Unpinned Session',
        `Manually ${entry?.isLocked ? 'locked' : 'unlocked'} entry against AI changes.`
      );
    },

    deleteEntry: (entryId) => {
      const { schedule, teachers, subjects, rooms, divisions, config, saveVersion } = get();
      const updated = schedule.filter((e) => e.id !== entryId);
      const evalRes = TimetableValidator.evaluateSchedule(updated, teachers, subjects, rooms, divisions, config);
      set({ schedule: updated, conflicts: evalRes.conflicts, metrics: evalRes.metrics });
      saveVersion('Deleted Session', 'Removed class session from schedule.');
      get().generateSuggestions();
    },

    isGenerating: false,

    generateTimetable: async () => {
      set({ isGenerating: true });
      let { teachers, subjects, rooms, divisions, selectedDivisionId, config, saveVersion } = get();
      
      if (teachers.length === 0) {
        teachers = [{ id: 'teacher-auto-1', name: 'General Faculty Member', teacherId: 'FAC-101', preferredTime: 'Any', maxHoursPerDay: 6, maxHoursPerWeek: 30, preferredSlots: [] }];
      }
      if (rooms.length === 0) {
        rooms = [
          { id: 'room-auto-1', name: 'Lecture Hall 101', roomNumber: '101', capacity: 60, type: 'Classroom' },
          { id: 'room-auto-lab', name: 'Computer Lab 201', roomNumber: '201', capacity: 40, type: 'Laboratory' }
        ];
      }
      if (divisions.length === 0) {
        divisions = [{ id: 'div-auto-1', name: 'Semester 1 - Div A', semester: 1, strength: 50 }];
      }
      if (subjects.length === 0) {
        subjects = [
          { id: 'sub-auto-1', name: 'Core Theory & Practice', code: 'CTP101', type: 'Theory', weeklyHours: 4, assignedTeacherId: teachers[0].id, priority: 'Labs', requiresLab: false, color: 'emerald' },
          { id: 'sub-auto-2', name: 'Applied Computing Lab', code: 'ACL102', type: 'Practical', weeklyHours: 2, assignedTeacherId: teachers[0].id, priority: 'Labs', requiresLab: true, color: 'teal' }
        ];
      } else {
        subjects = subjects.map((sub, i) => ({
          ...sub,
          assignedTeacherId: sub.assignedTeacherId || teachers[i % teachers.length].id,
          color: sub.color || 'emerald',
        }));
      }
      if (!divisions.some((d) => d.id === selectedDivisionId)) {
        selectedDivisionId = divisions[0]?.id || 'div-auto-1';
      }
      set({ teachers, subjects, rooms, divisions, selectedDivisionId });

      try {
        const response = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teachers,
            subjects,
            rooms,
            divisions,
            config,
            existingSchedule: get().schedule,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          if ((data.success || data.schedule) && (Array.isArray(data.schedule) || Array.isArray(data))) {
            const scheduleData = Array.isArray(data.schedule) ? data.schedule : (Array.isArray(data) ? data : []);
            if (scheduleData.length > 0) {
              const evalRes = TimetableValidator.evaluateSchedule(scheduleData, teachers, subjects, rooms, divisions, config);
              set({
                schedule: scheduleData,
                conflicts: data.conflicts || evalRes.conflicts,
                metrics: data.metrics || evalRes.metrics,
                selectedDivisionId: divisions.some((d) => d.id === get().selectedDivisionId) ? get().selectedDivisionId : divisions[0]?.id || 'div-auto-1',
                isGenerating: false,
              });
              saveVersion(data.engine || 'Smart Timetable Generation', 'Generated optimal conflict-free schedule.');
              get().generateSuggestions();
              return;
            }
          }
        }
      } catch (error) {
        console.warn('API route fallback triggered, using local solver');
      }
      // Fallback to local CSP solver
      get().generateSchedule();
      set({ isGenerating: false });
    },

    generateSchedule: () => {
      let { teachers, subjects, rooms, divisions, selectedDivisionId, config, schedule, saveVersion } = get();
      
      if (teachers.length === 0) {
        teachers = [{ id: 'teacher-auto-1', name: 'General Faculty Member', teacherId: 'FAC-101', preferredTime: 'Any', maxHoursPerDay: 6, maxHoursPerWeek: 30, preferredSlots: [] }];
      }
      if (rooms.length === 0) {
        rooms = [
          { id: 'room-auto-1', name: 'Lecture Hall 101', roomNumber: '101', capacity: 60, type: 'Classroom' },
          { id: 'room-auto-lab', name: 'Computer Lab 201', roomNumber: '201', capacity: 40, type: 'Laboratory' }
        ];
      }
      if (divisions.length === 0) {
        divisions = [{ id: 'div-auto-1', name: 'Semester 1 - Div A', semester: 1, strength: 50 }];
      }
      if (subjects.length === 0) {
        subjects = [
          { id: 'sub-auto-1', name: 'Core Theory & Practice', code: 'CTP101', type: 'Theory', weeklyHours: 4, assignedTeacherId: teachers[0].id, priority: 'Labs', requiresLab: false, color: 'emerald' },
          { id: 'sub-auto-2', name: 'Applied Computing Lab', code: 'ACL102', type: 'Practical', weeklyHours: 2, assignedTeacherId: teachers[0].id, priority: 'Labs', requiresLab: true, color: 'teal' }
        ];
      } else {
        subjects = subjects.map((sub, i) => ({
          ...sub,
          assignedTeacherId: sub.assignedTeacherId || teachers[i % teachers.length].id,
          color: sub.color || 'emerald',
        }));
      }
      if (!divisions.some((d) => d.id === selectedDivisionId)) {
        selectedDivisionId = divisions[0]?.id || 'div-auto-1';
      }
      set({ teachers, subjects, rooms, divisions, selectedDivisionId });

      const newSchedule = CSPSolver.generateSchedule(teachers, subjects, rooms, divisions, config, schedule);
      const evalRes = TimetableValidator.evaluateSchedule(newSchedule, teachers, subjects, rooms, divisions, config);
      set({
        schedule: newSchedule,
        conflicts: evalRes.conflicts,
        metrics: evalRes.metrics,
        selectedDivisionId: divisions.some((d) => d.id === get().selectedDivisionId) ? get().selectedDivisionId : divisions[0]?.id || 'div-auto-1',
      });
      saveVersion('AI Full Generation', 'Generated optimized conflict-free schedule using CSP algorithm.');
      get().generateSuggestions();
    },

    autoRepair: () => {
      const { schedule, teachers, subjects, rooms, divisions, config, saveVersion } = get();
      const { repairedSchedule, resolvedCount } = AutoRepairEngine.repairConflicts(
        schedule,
        teachers,
        subjects,
        rooms,
        divisions,
        config
      );
      const evalRes = TimetableValidator.evaluateSchedule(repairedSchedule, teachers, subjects, rooms, divisions, config);
      set({
        schedule: repairedSchedule,
        conflicts: evalRes.conflicts,
        metrics: evalRes.metrics,
      });
      if (resolvedCount > 0) {
        saveVersion('One-Click Auto Repair', `Automatically repaired ${resolvedCount} conflict(s).`);
      }
      get().generateSuggestions();
      return resolvedCount;
    },

    suggestions: [],
    generateSuggestions: () => {
      const { schedule, teachers, subjects, rooms, divisions, config, conflicts, metrics } = get();
      const suggestionsList: AISuggestion[] = [];

      // 1. Conflict Warning Suggestion
      if (conflicts.length > 0) {
        suggestionsList.push({
          id: 'sug-conflicts',
          type: 'conflict_warning',
          title: `Resolve ${conflicts.length} Active Schedule Conflict(s)`,
          description: `Detected ${conflicts.filter((c) => c.severity === 'hard').length} hard conflict(s) across teacher/room availability. Click 'Auto Repair' to resolve them automatically while preserving your pinned edits.`,
          impact: `+${Math.round((100 - metrics.conflictScore) * 0.45)}% Overall Score`,
          actionable: true,
          suggestedAction: () => get().autoRepair(),
        });
      }

      // 2. Teacher Workload Alert
      for (const teacher of teachers) {
        const tEntries = schedule.filter((e) => e.teacherId === teacher.id);
        const hours = tEntries.reduce((sum, e) => sum + e.span, 0);
        if (hours > teacher.maxHoursPerWeek - 2 && hours <= teacher.maxHoursPerWeek) {
          suggestionsList.push({
            id: `sug-tload-${teacher.id}`,
            type: 'workload_alert',
            title: `High Workload for ${teacher.name}`,
            description: `${teacher.name} is scheduled for ${hours}/${teacher.maxHoursPerWeek} weekly hours (${Math.round((hours / teacher.maxHoursPerWeek) * 100)}% capacity). Consider distributing remaining electives to co-faculty.`,
            impact: 'Improves Teacher Satisfaction & Workload Balance',
            actionable: false,
          });
        }
      }

      // 3. Lab Utilization Tip
      if (metrics.labUtilization < 85) {
        suggestionsList.push({
          id: 'sug-lab-util',
          type: 'optimization',
          title: 'Increase Laboratory Utilization',
          description: `Current Lab utilization is at ${metrics.labUtilization}%. You have open slots in AI & High Performance Computing Lab (L-201) on Friday afternoons.`,
          impact: '+5% Lab Utilization Score',
          actionable: true,
          suggestedAction: () => get().generateSchedule(),
        });
      }

      // 4. Subject Spacing Tip
      for (const d of divisions) {
        const friEntries = schedule.filter((e) => e.divisionId === d.id && e.day === 'Friday');
        if (friEntries.length < config.timings.periodsPerDay - 2) {
          suggestionsList.push({
            id: `sug-space-${d.id}`,
            type: 'spacing_tip',
            title: `Balance Weekly Load for ${d.name}`,
            description: `${d.name} has a light schedule on Friday (${friEntries.length} periods). Moving heavy morning lectures from Monday/Tuesday can optimize student cognitive load.`,
            impact: '+6% Student Fatigue & Spacing Score',
            actionable: false,
          });
          break;
        }
      }

      set({ suggestions: suggestionsList });
    },

    updateConfig: (newConfig) => {
      set((state) => {
        const updated = { ...state.config, ...newConfig };
        const evalRes = TimetableValidator.evaluateSchedule(state.schedule, state.teachers, state.subjects, state.rooms, state.divisions, updated);
        return { config: updated, conflicts: evalRes.conflicts, metrics: evalRes.metrics };
      });
    },

    addTeacher: (teacher) => set((state) => ({ teachers: [...state.teachers, teacher] })),
    updateTeacher: (id, updated) => set((state) => ({
      teachers: state.teachers.map((t) => (t.id === id ? { ...t, ...updated } : t)),
    })),
    deleteTeacher: (id) => set((state) => ({
      teachers: state.teachers.filter((t) => t.id !== id),
      schedule: state.schedule.filter((e) => e.teacherId !== id),
    })),

    addSubject: (subject) => set((state) => ({ subjects: [...state.subjects, subject] })),
    updateSubject: (id, updated) => set((state) => ({
      subjects: state.subjects.map((s) => (s.id === id ? { ...s, ...updated } : s)),
    })),
    deleteSubject: (id) => set((state) => ({
      subjects: state.subjects.filter((s) => s.id !== id),
      schedule: state.schedule.filter((e) => e.subjectId !== id),
    })),

    addRoom: (room) => set((state) => ({ rooms: [...state.rooms, room] })),
    updateRoom: (id, updated) => set((state) => ({
      rooms: state.rooms.map((r) => (r.id === id ? { ...r, ...updated } : r)),
    })),
    deleteRoom: (id) => set((state) => ({
      rooms: state.rooms.filter((r) => r.id !== id),
      schedule: state.schedule.filter((e) => e.roomId !== id),
    })),

    addDivision: (division) => set((state) => ({ divisions: [...state.divisions, division] })),
    updateDivision: (id, updated) => set((state) => ({
      divisions: state.divisions.map((d) => (d.id === id ? { ...d, ...updated } : d)),
    })),
    deleteDivision: (id) => set((state) => ({
      divisions: state.divisions.filter((d) => d.id !== id),
      schedule: state.schedule.filter((e) => e.divisionId !== id),
    })),
  };
},
{
  name: 'smart-timetable-storage',
  partialize: (state) => ({
    config: state.config,
    teachers: state.teachers,
    subjects: state.subjects,
    rooms: state.rooms,
    divisions: state.divisions,
    schedule: state.schedule,
    conflicts: state.conflicts,
    metrics: state.metrics,
    history: state.history,
    historyIndex: state.historyIndex,
    selectedDivisionId: state.selectedDivisionId,
  }),
  onRehydrateStorage: () => (state) => {
    if (state && (!state.schedule || state.schedule.length === 0)) {
      state.schedule = initialScheduleEntries;
    }
  },
})
);
