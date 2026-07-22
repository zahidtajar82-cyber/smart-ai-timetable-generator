'use client';

import React, { useState } from 'react';
import { useTimetableStore } from '@/store/useTimetableStore';
import { UserRole } from '@/lib/types';
import {
  ShieldCheck,
  GraduationCap,
  Users,
  Lock,
  User,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login } = useTimetableStore();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError('Please enter your User ID or Username.');
      return;
    }

    // Basic clean login verification
    if (selectedRole === 'admin') {
      if (password && password !== 'admin') {
        setError('Invalid admin credentials. Use "admin" or leave blank for demo.');
        return;
      }
    }

    login(selectedRole, identifier.trim(), password);
  };

  const roleConfigs = [
    {
      role: 'admin' as UserRole,
      title: 'Administrator',
      description: 'Manage institutional setup, enter faculty/subjects, and generate schedules.',
      icon: <ShieldCheck className="w-5 h-5" />,
      defaultId: 'admin',
    },
    {
      role: 'teacher' as UserRole,
      title: 'Teacher / Faculty',
      description: 'Access personal teaching timetable, room allocations, and student rosters.',
      icon: <GraduationCap className="w-5 h-5" />,
      defaultId: 'T101',
    },
    {
      role: 'student' as UserRole,
      title: 'Student Portal',
      description: 'View class division schedules, room locations, and active period notes.',
      icon: <Users className="w-5 h-5" />,
      defaultId: 'ST-2026',
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans select-none selection:bg-emerald-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 mx-auto mb-4">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
          Welcome to <span className="text-emerald-600 dark:text-emerald-400">Timetable Creator</span>
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
          Sign in to access your customized portal and schedule manager.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-white dark:bg-zinc-900 py-8 px-6 sm:px-10 shadow-xl shadow-zinc-200/60 dark:shadow-none rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80">
          {/* Role Selection Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 mb-6">
            {roleConfigs.map((item) => {
              const isActive = selectedRole === item.role;
              return (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => {
                    setSelectedRole(item.role);
                    setIdentifier(item.defaultId);
                    setError('');
                  }}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm border border-zinc-200/80 dark:border-zinc-700/80'
                      : 'text-zinc-600 dark:text-zinc-400 font-medium hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span className="text-xs mt-1 capitalize">{item.role}</span>
                </button>
              );
            })}
          </div>

          {/* Active Role Description Banner */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 mb-6 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/10 dark:bg-emerald-400/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 font-bold text-sm">
              ℹ
            </div>
            <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-snug">
              {roleConfigs.find((r) => r.role === selectedRole)?.description}
            </p>
          </div>

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                {selectedRole === 'admin' ? 'Admin Username' : selectedRole === 'teacher' ? 'Faculty ID / Code' : 'Student Roll Number'}
              </label>
              <div className="relative rounded-2xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={selectedRole === 'admin' ? 'e.g., admin' : selectedRole === 'teacher' ? 'e.g., T101 or Dr. Sharma' : 'e.g., ST-2026'}
                  className="block w-full pl-10 pr-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            {selectedRole === 'admin' && (
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Password <span className="text-zinc-400 font-normal">(Use "admin" or leave blank)</span>
                </label>
                <div className="relative rounded-2xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 text-xs font-semibold text-center">
                {error}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all group"
              >
                <span>Sign In to {selectedRole.toUpperCase()} Portal</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
