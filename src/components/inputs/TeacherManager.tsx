'use client';

import React, { useState } from 'react';
import { useTimetableStore } from '@/store/useTimetableStore';
import { Teacher, DayOfWeek } from '@/lib/types';
import { UserPlus, Trash2, Edit2, Check, X, Clock, AlertCircle } from 'lucide-react';

export const TeacherManager: React.FC = () => {
  const { teachers, addTeacher, updateTeacher, deleteTeacher, config } = useTimetableStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [preferredTime, setPreferredTime] = useState<'Morning' | 'Afternoon' | 'Any'>('Any');
  const [maxHoursPerDay, setMaxHoursPerDay] = useState(4);
  const [maxHoursPerWeek, setMaxHoursPerWeek] = useState(16);
  const [unavailableDays, setUnavailableDays] = useState<DayOfWeek[]>([]);
  const [unavailableSlots, setUnavailableSlots] = useState<string[]>([]);

  const resetForm = () => {
    setName('');
    setTeacherId('');
    setDepartment('Computer Science');
    setPreferredTime('Any');
    setMaxHoursPerDay(4);
    setMaxHoursPerWeek(16);
    setUnavailableDays([]);
    setUnavailableSlots([]);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleStartEdit = (t: Teacher) => {
    setName(t.name);
    setTeacherId(t.teacherId);
    setDepartment(t.department || 'Computer Science');
    setPreferredTime(t.preferredTime);
    setMaxHoursPerDay(t.maxHoursPerDay);
    setMaxHoursPerWeek(t.maxHoursPerWeek);
    setUnavailableDays(t.unavailableDays || []);
    setUnavailableSlots(t.unavailableSlots || []);
    setEditingId(t.id);
    setIsAdding(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateTeacher(editingId, {
        name,
        teacherId,
        department,
        preferredTime,
        maxHoursPerDay: Number(maxHoursPerDay),
        maxHoursPerWeek: Number(maxHoursPerWeek),
        unavailableDays,
        unavailableSlots,
      });
    } else {
      const newTeacher: Teacher = {
        id: `t-${Date.now()}`,
        name,
        teacherId,
        department,
        preferredTime,
        maxHoursPerDay: Number(maxHoursPerDay),
        maxHoursPerWeek: Number(maxHoursPerWeek),
        unavailableDays,
        unavailableSlots,
      };
      addTeacher(newTeacher);
    }
    resetForm();
  };

  const toggleUnavailableSlot = (slotKey: string) => {
    if (unavailableSlots.includes(slotKey)) {
      setUnavailableSlots(unavailableSlots.filter((s) => s !== slotKey));
    } else {
      setUnavailableSlots([...unavailableSlots, slotKey]);
    }
  };

  const periods = Array.from({ length: config.timings.periodsPerDay }, (_, i) => i + 1);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Faculty & Teacher Roster</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Manage teaching staff, workload capacity limits, and preferred schedule availability
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-emerald-500/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Faculty</span>
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSave} className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
              {editingId ? `Edit Faculty: ${name}` : 'Add New Faculty Member'}
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
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Dr. Rajesh Gupta"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Teacher ID / Code</label>
              <input
                type="text"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                required
                placeholder="CSE-109"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Preferred Shift</label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Any">Any Time (Flexible)</option>
                <option value="Morning">Morning Shift (Periods 1-3)</option>
                <option value="Afternoon">Afternoon Shift (Periods 4-6)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Max Hours / Day</label>
              <input
                type="number"
                min={1}
                max={8}
                value={maxHoursPerDay}
                onChange={(e) => setMaxHoursPerDay(Number(e.target.value))}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Max Hours / Week</label>
              <input
                type="number"
                min={4}
                max={30}
                value={maxHoursPerWeek}
                onChange={(e) => setMaxHoursPerWeek(Number(e.target.value))}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Specialization</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Database Systems"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Interactive Unavailable Time Slots Grid */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
              Mark Unavailable Time Slots (Click cells to toggle red)
            </label>
            <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-700 rounded-2xl p-3 bg-zinc-50/50 dark:bg-zinc-900/40">
              <div className="grid grid-cols-[100px_repeat(6,_minmax(65px,_1fr))] gap-1.5 min-w-[550px]">
                <div className="font-bold text-[11px] text-zinc-400 uppercase p-1">Day \ Period</div>
                {periods.map((p) => (
                  <div key={p} className="text-center font-bold text-xs text-zinc-600 dark:text-zinc-300 p-1">
                    P{p}
                  </div>
                ))}

                {config.workingDays.map((day) => (
                  <React.Fragment key={day}>
                    <div className="font-bold text-xs text-zinc-800 dark:text-zinc-200 p-1.5 flex items-center">
                      {day}
                    </div>
                    {periods.map((p) => {
                      const slotKey = `${day}-P${p}`;
                      const isUnavail = unavailableSlots.includes(slotKey);
                      return (
                        <button
                          key={slotKey}
                          type="button"
                          onClick={() => toggleUnavailableSlot(slotKey)}
                          className={`p-2 rounded-xl font-bold text-xs transition-all ${
                            isUnavail
                              ? 'bg-rose-500 text-white shadow-xs'
                              : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                          }`}
                          title={isUnavail ? 'Marked Unavailable (Click to clear)' : 'Click to mark unavailable'}
                        >
                          {isUnavail ? 'Busy' : 'Free'}
                        </button>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
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
              {editingId ? 'Update Faculty' : 'Save Faculty'}
            </button>
          </div>
        </form>
      )}

      {/* Roster List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.map((t) => (
          <div
            key={t.id}
            className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                  {t.teacherId}
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleStartEdit(t)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                    title="Edit Teacher"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteTeacher(t.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-all"
                    title="Delete Teacher"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h4 className="font-extrabold text-base text-zinc-900 dark:text-white leading-snug">{t.name}</h4>
              <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">{t.department || 'CSE'}</div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Preferred Shift:</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{t.preferredTime}</span>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Max Weekly Load:</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{t.maxHoursPerWeek} Hours</span>
              </div>
              {(t.unavailableSlots || []).length > 0 && (
                <div className="flex justify-between items-center text-rose-600 dark:text-rose-400 font-semibold pt-0.5">
                  <span className="flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" /> Busy Slots:
                  </span>
                  <span>{(t.unavailableSlots || []).length} slot(s)</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
