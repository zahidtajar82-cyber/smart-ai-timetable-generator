import { NextResponse } from 'next/server';
import { CSPSolver } from '@/lib/engine/csp-solver';
import { TimetableValidator } from '@/lib/engine/validator';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { config, teachers, subjects, rooms, divisions, existingSchedule } = body;

    // Try attempting connection to Python FastAPI OR-Tools backend first
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

      const pyResponse = await fetch('http://localhost:8000/api/ai/generate', {
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
        const pySchedule = await pyResponse.json();
        const evalRes = TimetableValidator.evaluateSchedule(pySchedule, teachers, subjects, rooms, divisions, config);
        return NextResponse.json({
          engine: 'Google OR-Tools CP-SAT (Python)',
          schedule: pySchedule,
          metrics: evalRes.metrics,
          conflicts: evalRes.conflicts,
        });
      }
    } catch (e) {
      // Python backend unreachable or timed out -> gracefully use our TypeScript CSP Solver
      console.log('Python OR-Tools engine not reached or timed out. Using TypeScript CSP engine fallback.');
    }

    // Fallback to high-speed TypeScript CSP Backtracking & Hill Climbing Solver
    const tsSchedule = CSPSolver.generateSchedule(teachers, subjects, rooms, divisions, config, existingSchedule || []);
    const evalRes = TimetableValidator.evaluateSchedule(tsSchedule, teachers, subjects, rooms, divisions, config);

    return NextResponse.json({
      engine: 'TypeScript Constraint Satisfaction Engine (CSP + Hill Climbing)',
      schedule: tsSchedule,
      metrics: evalRes.metrics,
      conflicts: evalRes.conflicts,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error generating schedule' }, { status: 500 });
  }
}
