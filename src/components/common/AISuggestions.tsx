'use client';

import React, { useEffect } from 'react';
import { useTimetableStore } from '@/store/useTimetableStore';
import {
  Lightbulb,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
} from 'lucide-react';

export const AISuggestions: React.FC = () => {
  const { suggestions, generateSuggestions, metrics, autoRepair } = useTimetableStore();

  useEffect(() => {
    generateSuggestions();
  }, [generateSuggestions]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-3">
            <BrainCircuit className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
            <span>AI Insights & Recommendations</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Intelligent Timetable Optimization
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">
            Our AI engine continuously scans your academic schedule for workload bottlenecks, lab under-utilization, and student cognitive fatigue patterns, offering explanation-backed one-click repairs.
          </p>
        </div>
      </div>

      {/* Suggestion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-zinc-200/80 dark:border-zinc-800">
            <Sparkles className="w-10 h-10 text-emerald-500 mx-auto mb-3 animate-bounce" />
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white">All Clear! Optimal Schedule</h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mt-1">
              No critical bottlenecks or fatigue issues detected right now. Your timetable is well-spaced and balanced across faculty.
            </p>
          </div>
        ) : (
          suggestions.map((sug) => {
            const isAlert = sug.type === 'bottleneck' || sug.type === 'workload_alert';
            return (
              <div
                key={sug.id}
                className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-4 transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase ${
                        isAlert
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                    >
                      {isAlert ? <AlertTriangle className="w-3 h-3 mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                      <span>{sug.type.replace('_', ' ')}</span>
                    </span>

                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                      <TrendingUp className="w-3.5 h-3.5 mr-1" />
                      {sug.impact}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-zinc-900 dark:text-white leading-snug">
                    {sug.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {sug.description}
                  </p>
                </div>

                {sug.actionable && sug.suggestedAction && (
                  <div className="pt-5 mt-3 border-t border-zinc-100 dark:border-zinc-800/60">
                    <button
                      onClick={() => sug.suggestedAction?.()}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all"
                    >
                      <span>Apply AI Optimization</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
