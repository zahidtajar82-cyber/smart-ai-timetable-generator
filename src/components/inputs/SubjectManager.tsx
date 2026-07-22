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
  const [color, setColor] = useState('#6366f1');
  const [assignedTeacherId, setAssignedTeacherId] = useState('');
  const [priority, setPriority] = useState<Subject['priority']>('normal');

  const colorOptions = ['#6366f1', '#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4', '#e11d48'];

  const resetForm = () => {
    setName('');
    setCode('');
    setType('Theory');
    setHoursPerWeek(4);
    setColor('#6366f1');
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
    setColor(s.color || '#6366f1');
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
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Subject & Course Catalog</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define subjects, theory/practical session types, weekly duration targets, and primary faculty assignments
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-indigo-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              {editingId ? `Edit Subject: ${code}` : 'Add New Course Subject'}
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
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Course Title</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Artificial Intelligence"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                placeholder="CS401"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Session Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Theory">Theory (1-period slots)</option>
                <option value="Practical">Practical / Lab (2-period block)</option>
                <option value="Tutorial">Tutorial Session</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Weekly Hours Target</label>
              <input
                type="number"
                min={1}
                max={12}
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Teacher</label>
              <select
                value={assignedTeacherId}
                onChange={(e) => setAssignedTeacherId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Scheduling Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="normal">Normal Priority</option>
                <option value="high">High (Schedule in mornings)</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Card Accent Color</label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setColor(col)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform ${
                    color === col ? 'scale-110 ring-2 ring-indigo-500 shadow-md' : 'hover:scale-105 opacity-80'
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
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold text-xs text-slate-700 dark:text-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all"
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
              className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: s.color || '#6366f1' }}
              />

              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700/80 text-slate-800 dark:text-slate-200 font-black text-xs uppercase">
                      {s.code}
                    </span>
                    {s.type === 'Practical' && (
                      <span className="px-2 py-0.5 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold text-[11px] flex items-center">
                        <Beaker className="w-3 h-3 mr-1" />
                        Lab
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleStartEdit(s)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                      title="Edit Subject"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteSubject(s.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-all"
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
