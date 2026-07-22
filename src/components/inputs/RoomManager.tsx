'use client';

import React, { useState } from 'react';
import { useTimetableStore } from '@/store/useTimetableStore';
import { Room } from '@/lib/types';
import { Building2, Plus, Trash2, Edit2, X, Beaker, Users } from 'lucide-react';

export const RoomManager: React.FC = () => {
  const { rooms, addRoom, updateRoom, deleteRoom } = useTimetableStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [roomNumber, setRoomNumber] = useState('');
  const [capacity, setCapacity] = useState(60);
  const [type, setType] = useState<'Classroom' | 'Laboratory'>('Classroom');

  const resetForm = () => {
    setRoomNumber('');
    setCapacity(60);
    setType('Classroom');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleStartEdit = (r: Room) => {
    setRoomNumber(r.roomNumber);
    setCapacity(r.capacity);
    setType(r.type);
    setEditingId(r.id);
    setIsAdding(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateRoom(editingId, {
        roomNumber,
        capacity: Number(capacity),
        type,
      });
    } else {
      const newRoom: Room = {
        id: `r-${Date.now()}`,
        roomNumber,
        capacity: Number(capacity),
        type,
        availableEquipment: [],
      };
      addRoom(newRoom);
    }
    resetForm();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Classrooms & Laboratories</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define teaching venues, seating capacities, and distinguish classrooms from practical labs
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-indigo-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Venue</span>
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-4 max-w-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              {editingId ? `Edit Venue: ${roomNumber}` : 'Add New Classroom / Lab'}
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
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Room / Lab Number</label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                required
                placeholder="Room 301 / Lab-C"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Seating Capacity</label>
              <input
                type="number"
                min={10}
                max={250}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Venue Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Classroom">Classroom</option>
                <option value="Laboratory">Laboratory</option>
              </select>
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
              {editingId ? 'Update Venue' : 'Save Venue'}
            </button>
          </div>
        </form>
      )}

      {/* Roster Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {rooms.map((r) => (
          <div
            key={r.id}
            className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center space-x-1 ${
                    r.type === 'Laboratory'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                      : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                  }`}
                >
                  {r.type === 'Laboratory' ? <Beaker className="w-3.5 h-3.5 mr-1" /> : <Building2 className="w-3.5 h-3.5 mr-1" />}
                  <span>{r.type}</span>
                </span>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleStartEdit(r)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                    title="Edit Room"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteRoom(r.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-all"
                    title="Delete Room"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h4 className="font-extrabold text-lg text-slate-900 dark:text-white mt-2">{r.roomNumber}</h4>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center">
                <Users className="w-3.5 h-3.5 mr-1 text-slate-400" /> Seating Capacity
              </span>
              <span className="font-bold text-slate-900 dark:text-white">{r.capacity} Seats</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
