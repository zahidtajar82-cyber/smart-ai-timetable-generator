'use client';

import React from 'react';
import { QualityMetrics } from '@/lib/types';
import { Award, ShieldCheck, UserCheck, Building2, Beaker, Layers } from 'lucide-react';

interface QualityMeterProps {
  metrics: QualityMetrics;
}

export const QualityMeter: React.FC<QualityMeterProps> = ({ metrics }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-500 from-emerald-500 to-teal-500 border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20';
    if (score >= 75) return 'text-indigo-500 from-indigo-500 to-purple-500 border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/20';
    if (score >= 60) return 'text-amber-500 from-amber-500 to-orange-500 border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20';
    return 'text-rose-500 from-rose-500 to-red-500 border-rose-500/30 bg-rose-50/50 dark:bg-rose-950/20';
  };

  const breakdowns = [
    { label: 'Conflict Free Index', score: metrics.conflictScore, weight: '45%', icon: ShieldCheck, color: 'text-indigo-500' },
    { label: 'Teacher Satisfaction & Load', score: metrics.teacherSatisfaction, weight: '15%', icon: UserCheck, color: 'text-purple-500' },
    { label: 'Classroom Utilization', score: metrics.classroomUtilization, weight: '15%', icon: Building2, color: 'text-blue-500' },
    { label: 'Laboratory Utilization', score: metrics.labUtilization, weight: '10%', icon: Beaker, color: 'text-teal-500' },
    { label: 'Subject Spacing & Fatigue', score: metrics.subjectDistribution, weight: '15%', icon: Layers, color: 'text-pink-500' },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
              AI Timetable Quality Meter
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Composite score derived from CP-SAT constraint solver evaluation
            </p>
          </div>
        </div>

        {/* Big Overall Score Badge */}
        <div className={`px-5 py-3 rounded-2xl border flex flex-col items-end ${getScoreColor(metrics.overallScore)}`}>
          <div className="text-2xl sm:text-3xl font-black leading-none">{metrics.overallScore}%</div>
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-80 mt-1">Overall Quality</div>
        </div>
      </div>

      {/* Breakdown Bars */}
      <div className="space-y-4">
        {breakdowns.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                  <Icon className={`w-4 h-4 ${item.color}`} />
                  <span>{item.label}</span>
                  <span className="text-[10px] font-normal text-slate-400">({item.weight} weight)</span>
                </div>
                <span className="font-extrabold text-slate-900 dark:text-white">{item.score}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
