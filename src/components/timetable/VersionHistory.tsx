'use client';

import React from 'react';
import { useTimetableStore } from '@/store/useTimetableStore';
import { History, RotateCcw, CheckCircle2, ArrowRight } from 'lucide-react';

export const VersionHistory: React.FC = () => {
  const { history, historyIndex, restoreVersion, undo, redo } = useTimetableStore();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
              Version History & Checkpoints
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Every drag-and-drop edit or AI generation creates a checkpoint. Click to revert instantly.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-40 transition-all"
          >
            Undo
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-40 transition-all"
          >
            Redo
          </button>
        </div>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {history.map((ver, idx) => {
          const isCurrent = idx === historyIndex;
          const score = ver.metrics.overallScore;
          const prevScore = idx > 0 ? history[idx - 1].metrics.overallScore : score;
          const scoreDiff = score - prevScore;

          return (
            <div
              key={ver.id}
              className={`p-4 rounded-2xl border transition-all duration-150 flex items-center justify-between ${
                isCurrent
                  ? 'bg-gradient-to-r from-indigo-50/80 to-purple-50/40 dark:from-indigo-950/40 dark:to-purple-950/20 border-indigo-300 dark:border-indigo-700 shadow-sm'
                  : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {idx + 1}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{ver.title}</span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold uppercase">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{ver.description}</p>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 flex items-center space-x-3">
                    <span>{ver.timestamp}</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      Score: {score}%
                    </span>
                    {idx > 0 && scoreDiff !== 0 && (
                      <span
                        className={`font-bold ${
                          scoreDiff > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        ({scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff}%)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!isCurrent && (
                <button
                  onClick={() => restoreVersion(idx)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 text-xs font-bold text-indigo-600 dark:text-indigo-400 shadow-xs flex items-center space-x-1 transition-all shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  <span>Restore</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
