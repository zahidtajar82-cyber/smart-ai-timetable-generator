'use client';

import React from 'react';
import { AlertTriangle, Wrench, X, ShieldAlert, Check } from 'lucide-react';
import { useTimetableStore } from '@/store/useTimetableStore';

interface ConflictDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conflictDescription: string;
}

export const ConflictDialog: React.FC<ConflictDialogProps> = ({
  isOpen,
  onClose,
  conflictDescription,
}) => {
  const { autoRepair, undo } = useTimetableStore();

  if (!isOpen) return null;

  const handleAutoFix = () => {
    autoRepair();
    onClose();
  };

  const handleIgnore = () => {
    // Keep the move with conflict badge
    onClose();
  };

  const handleCancel = () => {
    // Revert the invalid move
    undo();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 transform transition-all scale-100">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-300 shrink-0 shadow-md">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              Schedule Conflict Detected
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              The drag-and-drop move violates hard institutional constraints.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conflict Description Panel */}
        <div className="my-5 p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs sm:text-sm text-rose-900 dark:text-rose-200 font-medium leading-relaxed">
          <div className="flex items-center space-x-2 font-bold mb-1 text-rose-700 dark:text-rose-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Violation Details:</span>
          </div>
          {conflictDescription}
        </div>

        {/* Action Options */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleAutoFix}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all"
          >
            <Wrench className="w-4 h-4" />
            <span>AI Auto Fix (Recommended)</span>
          </button>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleIgnore}
              className="py-2.5 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all"
            >
              <Check className="w-3.5 h-3.5 text-amber-500" />
              <span>Ignore & Keep</span>
            </button>
            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-semibold text-xs transition-all"
            >
              Cancel Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
