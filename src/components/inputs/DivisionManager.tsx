'use client';

import React, { useState } from 'react';
import { useTimetableStore } from '@/store/useTimetableStore';
import { Division } from '@/lib/types';
import { Layers, Plus, Trash2, Edit2, X, Users } from 'lucide-react';

export const DivisionManager: React.FC = () => {
  const { divisions, addDivision, updateDivision, deleteDivision } = useTimetableStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [semester, setSemester] = useState(4);
  const [strength, setStrength] = useState(60);

  const resetForm = () => {
    setName('');
    setSemester(4);
    setStrength(60);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleStartEdit = (d: Division) => {
    setName(d.name);
    setSemester(d.semester);
    setStrength(d.strength);
    setEditingId(d.id);
    setIsAdding(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateDivision(editingId, {
        name,
        semester: Number(semester),
        strength: Number(strength),
      });
    } else {
      const newDiv: Division = {
        id: `div-${Date.now()}`,
        name,
        semester: Number(semester),
        strength: Number(strength),
      };
      addDivision(newDiv);
    }
    resetForm();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Academic Divisions & Batches</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define student divisions, batch strengths, and corresponding semester levels
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-indigo-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Division</span>
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-4 max-w-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              {editingId ? `Edit Division: ${name}` : 'Add New Student Division'}
            </h4>
            <button
              type="button"
              onClick={resetForm}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Division Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="SE - A / TE - CSE"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Semester Level</label>
              <input
                type="number"
                min={1}
                max={8}
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Student Strength</label>
              <input
                type="number"
                min={10}
                max={200}
                value={strength}
                onChange={(e) => setStrength(Number(e.target.value))}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold text-xs text-slate-700 dark:text-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all"
            >
              {editingId ? 'Update Division' : 'Save Division'}
            </button>
          </div>
        </form>
      )}

      {/* Roster Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {divisions.map((d) => (
          <div
            key={d.id}
            className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs">
                  Semester {d.semester}
                </span>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleStartEdit(d)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                    title="Edit Division"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteDivision(d.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-all"
                    title="Delete Division"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h4 className="font-extrabold text-lg text-slate-900 dark:text-white mt-2">{d.name}</h4>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center">
                <Users className="w-3.5 h-3.5 mr-1 text-slate-400" /> Total Enrolled
              </span>
              <span className="font-bold text-slate-900 dark:text-white">{d.strength} Students</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
