'use client';

import React, { useState } from 'react';
import { useTimetableStore } from '@/store/useTimetableStore';
import {
  FileText,
  Table,
  Printer,
  QrCode,
  X,
  Check,
  Share2,
  Download,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { schedule, subjects, teachers, rooms, divisions, config } = useTimetableStore();
  const [copiedQR, setCopiedQR] = useState(false);

  if (!isOpen) return null;

  const handleExportCSV = () => {
    const headers = ['Division', 'Day', 'Period', 'Time', 'Subject Code', 'Subject Name', 'Teacher', 'Room', 'Type'];
    const rows = schedule.map((e) => {
      const sub = subjects.find((s) => s.id === e.subjectId);
      const tea = teachers.find((t) => t.id === e.teacherId);
      const rm = rooms.find((r) => r.id === e.roomId);
      const div = divisions.find((d) => d.id === e.divisionId);
      return [
        div?.name || '',
        e.day,
        `Period ${e.period}`,
        '',
        sub?.code || '',
        sub?.name || '',
        tea?.name || '',
        rm?.roomNumber || '',
        sub?.type || '',
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${config.department.replace(/\s+/g, '_')}_Timetable.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleShareQR = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedQR(true);
    setTimeout(() => setCopiedQR(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                Export & Share Timetable
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Choose format for institutional distribution or offline viewing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <button
            onClick={handlePrintPDF}
            className="flex items-start space-x-3.5 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-zinc-50/50 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 text-left transition-all group"
          >
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 group-hover:scale-110 transition-transform shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-zinc-900 dark:text-white">Print / Save PDF</div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                Formatted layout optimized for direct printing and offline PDF saving
              </p>
            </div>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-start space-x-3.5 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-zinc-50/50 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 text-left transition-all group"
          >
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 group-hover:scale-110 transition-transform shrink-0">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-zinc-900 dark:text-white">Excel / CSV Export</div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                Spreadsheet format ready for institutional ERP or Excel analytics
              </p>
            </div>
          </button>
        </div>

        {/* Shareable QR Code Section */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-2xl bg-white dark:bg-zinc-800 shadow-xs border border-emerald-100 dark:border-zinc-700 text-emerald-600 dark:text-emerald-400">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-200">
                Live Timetable Access Link
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                Students and teachers can scan or open link for real-time updates
              </p>
            </div>
          </div>

          <button
            onClick={handleShareQR}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm active:scale-95 transition-all shrink-0"
          >
            {copiedQR ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
