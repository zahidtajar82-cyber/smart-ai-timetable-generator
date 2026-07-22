'use client';

import React, { useState } from 'react';
import { useTimetableStore } from '@/store/useTimetableStore';
import {
  Calendar,
  Sliders,
  FileText,
  CheckSquare,
  Download,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'Smart Timetable Creator',
    description: 'Easily design, customize, and automatically generate conflict-free schedules with powerful constraint algorithms.',
    icon: <Calendar className="w-16 h-16 text-emerald-600 dark:text-emerald-400 stroke-[1.5]" />,
    badge: 'Overview',
  },
  {
    id: 2,
    title: 'Customizable Text and Background',
    description: 'Adjust text color, background, and size for optimal readability across departments and divisions.',
    icon: <Sliders className="w-16 h-16 text-emerald-600 dark:text-emerald-400 stroke-[1.5]" />,
    badge: 'Design & Styling',
  },
  {
    id: 3,
    title: 'Add and View Notes',
    description: 'Add specific instructions, lab prerequisites, and view detailed notes directly on each timetable cell.',
    icon: <FileText className="w-16 h-16 text-emerald-600 dark:text-emerald-400 stroke-[1.5]" />,
    badge: 'Collaboration',
  },
  {
    id: 4,
    title: 'Daily Planner',
    description: 'Plan your daily academic tasks efficiently with dedicated faculty and student view portals.',
    icon: <CheckSquare className="w-16 h-16 text-emerald-600 dark:text-emerald-400 stroke-[1.5]" />,
    badge: 'Productivity',
  },
  {
    id: 5,
    title: 'PDF Generation',
    description: 'Export professional, publication-ready PDFs, Excel spreadsheets, and CSVs of your timetables instantly.',
    icon: <Download className="w-16 h-16 text-emerald-600 dark:text-emerald-400 stroke-[1.5]" />,
    badge: 'Instant Export',
  },
];

export const IntroCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { finishIntro } = useTimetableStore();

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishIntro();
    }
  };

  const currentSlide = slides[currentIndex];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col justify-between p-6 sm:p-10 font-sans select-none selection:bg-emerald-500 selection:text-white">
      {/* Top Header / Skip */}
      <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-zinc-900 dark:text-white">
            Smart<span className="text-emerald-600 dark:text-emerald-400">Timetable</span>
          </span>
        </div>

        <button
          onClick={finishIntro}
          className="text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
        >
          Skip Intro
        </button>
      </div>

      {/* Main Slide Content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full text-center my-8">
        {/* Illustration Container */}
        <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col items-center justify-center p-8 mb-8 relative shadow-lg shadow-zinc-200/50 dark:shadow-none overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-3xl" />
          <div className="z-10 transform group-hover:scale-105 transition-transform duration-300">
            {currentSlide.icon}
          </div>
          <span className="absolute bottom-4 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            {currentSlide.badge}
          </span>
        </div>

        {/* Text Area with Teal Underline Accent */}
        <div className="space-y-3 px-4">
          <div className="inline-block relative">
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              {currentSlide.title}
            </h1>
            <div className="h-1.5 w-1/2 bg-emerald-500 rounded-full mt-1 mx-auto shadow-xs" />
          </div>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed max-w-md mx-auto pt-2">
            {currentSlide.description}
          </p>
        </div>
      </div>

      {/* Footer / Controls */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pt-6 border-t border-zinc-100 dark:border-zinc-900">
        {/* Step Dots */}
        <div className="flex items-center space-x-2">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'w-7 bg-emerald-600 shadow-sm shadow-emerald-500/30'
                  : 'w-2.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700'
              }`}
            />
          ))}
        </div>

        {/* Next / Get Started Button */}
        <button
          onClick={handleNext}
          className="flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition-all group"
        >
          <span>{currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}</span>
          {currentIndex === slides.length - 1 ? (
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
          ) : (
            <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
          )}
        </button>
      </div>
    </div>
  );
};
