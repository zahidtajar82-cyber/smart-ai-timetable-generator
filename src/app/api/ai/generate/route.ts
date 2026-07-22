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
        const pySchedule = Array.isArray(pyData) ? pyData : (pyData.schedule || []);
        const evalRes = TimetableValidator.evaluateSchedule(pySchedule, teachers, subjects, rooms, divisions, config);
        return NextResponse.json({
          success: true,
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
