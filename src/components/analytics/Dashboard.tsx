'use client';

import React from 'react';
import { useTimetableStore } from '@/store/useTimetableStore';
import { QualityMeter } from './QualityMeter';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  TrendingUp,
  Users,
  Building2,
  CalendarCheck,
  AlertOctagon,
  CheckCircle,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { schedule, teachers, rooms, divisions, config, metrics, conflicts } = useTimetableStore();

  const totalClassesScheduled = schedule.reduce((sum, e) => sum + e.span, 0);
  const totalSlotsAvailable = config.workingDays.length * config.timings.periodsPerDay * divisions.length;
  const freePeriodsCount = Math.max(0, totalSlotsAvailable - totalClassesScheduled);
  const hardConflictsCount = conflicts.filter((c) => c.severity === 'hard').length;

  // Prepare data for Teacher Load BarChart
  const teacherLoadData = teachers.map((t) => {
    const tEntries = schedule.filter((e) => e.teacherId === t.id);
    const assignedHours = tEntries.reduce((sum, e) => sum + e.span, 0);
    return {
      name: t.name.replace(/(Dr\.|Prof\.)\s*/, ''),
      hours: assignedHours,
      maxHours: t.maxHoursPerWeek,
      utilization: Math.round((assignedHours / t.maxHoursPerWeek) * 100),
    };
  });

  // Prepare data for Room & Lab Utilization
  const roomUtilizationData = rooms.map((r) => {
    const rEntries = schedule.filter((e) => e.roomId === r.id);
    const usedSlots = rEntries.reduce((sum, e) => sum + e.span, 0);
    const maxSlots = config.workingDays.length * config.timings.periodsPerDay;
    return {
      name: r.roomNumber.split(' ')[0],
      type: r.type,
      used: usedSlots,
      max: maxSlots,
      percent: Math.round((usedSlots / maxSlots) * 100),
    };
  });

  const COLORS = ['#6366f1', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Stat Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {totalClassesScheduled}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Classes</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {teachers.length}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Faculty</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {rooms.length}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Rooms & Labs</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${hardConflictsCount === 0 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 animate-bounce'}`}>
            {hardConflictsCount === 0 ? <CheckCircle className="w-6 h-6" /> : <AlertOctagon className="w-6 h-6" />}
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {hardConflictsCount}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Conflicts</div>
          </div>
        </div>
      </div>

      {/* Quality Meter & Conflict Breakdown */}
      <QualityMeter metrics={metrics} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teacher Workload Bar Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white mb-1">
            Faculty Workload Distribution
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Assigned weekly teaching hours vs maximum capacity limit
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teacherLoadData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} angle={-25} textAnchor="end" />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff', border: 'none' }}
                />
                <Bar dataKey="hours" name="Assigned Hours" radius={[6, 6, 0, 0]}>
                  {teacherLoadData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.hours > entry.maxHours ? '#ef4444' : COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Room Utilization Bar Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white mb-1">
            Room & Lab Slot Utilization
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Percentage of weekly slots currently occupied
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roomUtilizationData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff', border: 'none' }}
                />
                <Bar dataKey="percent" name="Utilization %" radius={[6, 6, 0, 0]}>
                  {roomUtilizationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.type === 'Laboratory' ? '#8b5cf6' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
