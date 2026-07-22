'use client';

import React, { useState } from 'react';
import { useTimetableStore } from '@/store/useTimetableStore';
import { Subject } from '@/lib/types';
import { BookOpen, Plus, Trash2, Edit2, X, Check, Beaker } from 'lucide-react';

export const SubjectManager: React.FC = () => {
  const { subjects, addSubject, updateSubject, deleteSubject, teachers } = useTimetableStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<'Theory' | 'Practical' | 'Tutorial'>('Theory');
  const [hoursPerWeek, setHoursPerWeek] = useState(4);
  const [color, setColor] = useState('#10b981');
  const [assignedTeacherId, setAssignedTeacherId] = useState('');
  const [priority, setPriority] = useState<Subject['priority']>('normal');

  const colorOptions = ['#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#f59e0b', '#f97316', '#64748b', '#71717a'];

  const resetForm = () => {
    setName('');
    setCode('');
    setType('Theory');
    setHoursPerWeek(4);
    setColor('#10b981');
    setAssignedTeacherId('');
    setPriority('normal');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleStartEdit = (s: Subject) => {
    setName(s.name);
    setCode(s.code);
    setType(s.type);
    setHoursPerWeek(s.hoursPerWeek || s.weeklyHours || 4);
    setColor(s.color || '#10b981');
    setAssignedTeacherId(s.assignedTeacherId || '');
    setPriority(s.priority || 'normal');
    setEditingId(s.id);
    setIsAdding(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateSubject(editingId, {
        name,
        code,
        type,
        weeklyHours: Number(hoursPerWeek),
        hoursPerWeek: Number(hoursPerWeek),
        color,
        assignedTeacherId: assignedTeacherId || undefined,
        priority,
      });
    } else {
      const newSubject: Subject = {
        id: `sub-${Date.now()}`,
        name,
        code,
        type,
        weeklyHours: Number(hoursPerWeek),
        hoursPerWeek: Number(hoursPerWeek),
        color,
        assignedTeacherId: assignedTeacherId || '',
        requiresLab: type === 'Practical',
        priority,
      };
      addSubject(newSubject);
    }
    resetForm();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Subject & Course Catalog</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Define subjects, theory/practical session types, weekly duration targets, and primary faculty assignments
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSave} className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
              {editingId ? `Edit Subject: ${code}` : 'Add New Course Subject'}
            </h4>
            <button
              type="button"
              onClick={resetForm}
              className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Course Title</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Artificial Intelligence"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Subject Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                placeholder="CS401"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Session Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Theory">Theory (1-period slots)</option>
                <option value="Practical">Practical / Lab (2-period block)</option>
                <option value="Tutorial">Tutorial Session</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Weekly Hours Target</label>
              <input
                type="number"
                min={1}
                max={12}
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Assigned Teacher</label>
              <select
                value={assignedTeacherId}
                onChange={(e) => setAssignedTeacherId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Unassigned (AI will select)</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.teacherId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Scheduling Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="normal">Normal Priority</option>
                <option value="high">High (Schedule in mornings)</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">Card Accent Color</label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setColor(col)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform ${
                    color === col ? 'scale-110 ring-2 ring-emerald-500 shadow-md' : 'hover:scale-105 opacity-80'
                  }`}
                  style={{ backgroundColor: col }}
                >
                  {color === col && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-semibold text-xs text-zinc-700 dark:text-zinc-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
            >
              {editingId ? 'Update Subject' : 'Save Subject'}
            </button>
          </div>
        </form>
      )}

      {/* Catalog List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((s) => {
          const tea = teachers.find((t) => t.id === s.assignedTeacherId);
          return (
            <div
              key={s.id}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all relative overflow-hidden flex flex-col justify-between"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: s.color || '#10b981' }}
              />

              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-black text-xs uppercase">
                      {s.code}
                    </span>
                    {s.type === 'Practical' && (
                      <span className="px-2 py-0.5 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold text-[11px] flex items-center">
                        <Beaker className="w-3 h-3 mr-1" />
                        Lab
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleStartEdit(s)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                      title="Edit Subject"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteSubject(s.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-all"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug">{s.name}</h4>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Assigned Faculty:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                    {tea?.name || 'Unassigned'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Weekly Target:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{s.hoursPerWeek || s.weeklyHours} Hours</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
