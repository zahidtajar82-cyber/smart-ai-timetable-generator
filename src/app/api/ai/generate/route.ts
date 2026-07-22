import { NextResponse } from 'next/server';
import { CSPSolver } from '@/lib/engine/csp-solver';
import { TimetableValidator } from '@/lib/engine/validator';
import { AutoRepairEngine } from '@/lib/engine/auto-repair';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { config, teachers = [], subjects = [], rooms = [], divisions = [], existingSchedule = [] } = body;

    if (!Array.isArray(teachers) || teachers.length === 0) {
      teachers = [{ id: 'teacher-auto-1', name: 'General Faculty Member', teacherId: 'FAC-101', preferredTime: 'Any', maxHoursPerDay: 6, maxHoursPerWeek: 30, preferredSlots: [] }];
    }
    if (!Array.isArray(rooms) || rooms.length === 0) {
      rooms = [
        { id: 'room-auto-1', name: 'Lecture Hall 101', roomNumber: '101', capacity: 60, type: 'Classroom' },
        { id: 'room-auto-lab', name: 'Computer Lab 201', roomNumber: '201', capacity: 40, type: 'Laboratory' }
      ];
    }
    if (!Array.isArray(divisions) || divisions.length === 0) {
      divisions = [{ id: 'div-auto-1', name: 'Semester 1 - Div A', semester: 1, strength: 50 }];
    }
    if (!Array.isArray(subjects) || subjects.length === 0) {
      subjects = [
        { id: 'sub-auto-1', name: 'Core Theory & Practice', code: 'CTP101', type: 'Theory', weeklyHours: 4, assignedTeacherId: teachers[0].id, priority: 'Labs', requiresLab: false, color: 'emerald' },
        { id: 'sub-auto-2', name: 'Applied Computing Lab', code: 'ACL102', type: 'Practical', weeklyHours: 2, assignedTeacherId: teachers[0].id, priority: 'Labs', requiresLab: true, color: 'teal' }
      ];
    } else {
      subjects = subjects.map((sub: any, i: number) => ({
        ...sub,
        assignedTeacherId: sub.assignedTeacherId || teachers[i % teachers.length].id,
        color: sub.color || 'emerald',
      }));
    }

    // Try attempting connection to Python FastAPI OR-Tools backend first
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout to allow Render free tier wake-up

      const backendUrl = process.env.PYTHON_BACKEND_URL || process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || 'https://smart-ai-timetable-generator.onrender.com';
      const targetUrl = `${backendUrl.replace(/\/$/, '')}/api/ai/generate`;

      const pyResponse = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config,
          teachers,
          subjects,
          rooms,
          divisions,
          existingSchedule: existingSchedule || [],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (pyResponse.ok) {
        const pyData = await pyResponse.json();
        let pySchedule = Array.isArray(pyData) ? pyData : (pyData.schedule || []);
        if (pySchedule.length > 0) {
          let evalRes = TimetableValidator.evaluateSchedule(pySchedule, teachers, subjects, rooms, divisions, config);
          if (evalRes.conflicts.filter((c) => c.severity === 'hard').length > 0) {
            // Repair server-side if Python returned conflicts
            const repaired = AutoRepairEngine.repairConflicts(pySchedule, teachers, subjects, rooms, divisions, config);
            pySchedule = repaired.repairedSchedule;
            evalRes = TimetableValidator.evaluateSchedule(pySchedule, teachers, subjects, rooms, divisions, config);
          }
          // If 0 conflicts or repaired successfully, return Python schedule
          if (evalRes.conflicts.filter((c) => c.severity === 'hard').length === 0) {
            return NextResponse.json({
              success: true,
              engine: 'Google OR-Tools CP-SAT (Python)',
              schedule: pySchedule,
              metrics: evalRes.metrics,
              conflicts: evalRes.conflicts,
            });
          }
        }
        console.log('Python OR-Tools returned conflicts or empty schedule. Falling back to TypeScript CSP engine.');
      }
    } catch (e) {
      // Python backend unreachable or timed out -> gracefully use our TypeScript CSP Solver
      console.log('Python OR-Tools engine not reached or timed out. Using TypeScript CSP engine fallback.');
    }

    // Fallback to high-speed TypeScript CSP Backtracking & Hill Climbing Solver
    const tsSchedule = CSPSolver.generateSchedule(teachers, subjects, rooms, divisions, config, existingSchedule || []);
    const evalRes = TimetableValidator.evaluateSchedule(tsSchedule, teachers, subjects, rooms, divisions, config);

    return NextResponse.json({
      success: true,
      engine: 'TypeScript Constraint Satisfaction Engine (CSP + Hill Climbing)',
      schedule: tsSchedule,
      metrics: evalRes.metrics,
      conflicts: evalRes.conflicts,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Error generating schedule' }, { status: 500 });
  }
}
