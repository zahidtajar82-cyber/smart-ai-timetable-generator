'use client';

import React from 'react';
import { useTimetableStore } from '@/store/useTimetableStore';
import { History, RotateCcw, CheckCircle2, ArrowRight } from 'lucide-react';

export const VersionHistory: React.FC = () => {
  const { history, historyIndex, restoreVersion, undo, redo } = useTimetableStore();

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-white">
              Version History & Checkpoints
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Every drag-and-drop edit or AI generation creates a checkpoint. Click to revert instantly.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 disabled:opacity-40 transition-all"
          >
            Undo
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 disabled:opacity-40 transition-all"
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
                  ? 'bg-gradient-to-r from-emerald-50/80 to-teal-50/40 dark:from-emerald-950/40 dark:to-teal-950/20 border-emerald-300 dark:border-emerald-700 shadow-xs'
                  : 'bg-zinc-50/60 dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isCurrent
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {idx + 1}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-zinc-900 dark:text-white">{ver.title}</span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold uppercase">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{ver.description}</p>
                  <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 flex items-center space-x-3">
                    <span>{ver.timestamp}</span>
                    <span>•</span>
                    <span className="font-semibold text-zinc-600 dark:text-zinc-300">
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
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-400 dark:hover:border-emerald-500 text-xs font-bold text-emerald-600 dark:text-emerald-400 shadow-xs flex items-center space-x-1 transition-all shrink-0"
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
