import React from 'react';
import { 
  X, 
  Smartphone, 
  Bell, 
  Calendar, 
  TrendingUp, 
  ShieldCheck, 
  ExternalLink, 
  Sparkles,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface EWUmateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EWUmateModal: React.FC<EWUmateModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-purple-500/30 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-100 overflow-hidden">
        {/* Glow effect background */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[11px] font-bold uppercase tracking-wider mb-1">
              Official EWU Student Suite
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Supercharge your semester with EWUmate
            </h2>
          </div>
        </div>

        <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
          EWUmate is the dedicated companion built specifically for East West University students to streamline university life from advising to finals.
        </p>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-purple-500/20 hover:border-purple-500/40 transition-all">
            <div className="flex items-center gap-2.5 mb-1.5 text-purple-400 font-bold text-sm">
              <Bell className="w-4 h-4 text-purple-400" />
              <span>Smart Gap Reminders</span>
            </div>
            <p className="text-xs text-slate-400 leading-normal">
              Intelligent notifications scheduled right before class (1h, 30m, 15m) and optimized for short/long gap periods between sections.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-indigo-500/20 hover:border-indigo-500/40 transition-all">
            <div className="flex items-center gap-2.5 mb-1.5 text-indigo-400 font-bold text-sm">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Live Class Schedule</span>
            </div>
            <p className="text-xs text-slate-400 leading-normal">
              Interactive daily schedule synced with your portal sections, room numbers, faculty codes, and exam routines.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center gap-2.5 mb-1.5 text-emerald-400 font-bold text-sm">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>CGPA Goal Tracker</span>
            </div>
            <p className="text-xs text-slate-400 leading-normal">
              Predict required course grades to reach target CGPAs, calculate semester projections, and monitor retake improvements.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-cyan-500/20 hover:border-cyan-500/40 transition-all">
            <div className="flex items-center gap-2.5 mb-1.5 text-cyan-400 font-bold text-sm">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Advising Helper</span>
            </div>
            <p className="text-xs text-slate-400 leading-normal">
              Simulate section combinations, check seat availability in real time, and avoid time-slot clashes.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <a
            href="https://ewumate.pro.bd"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-bold text-sm hover:opacity-95 active:scale-95 transition-all shadow-lg shadow-purple-600/30"
          >
            <Smartphone className="w-4 h-4" />
            <span>Launch EWUmate App / PWA</span>
            <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
          </a>

          <a
            href="https://services.ewumate.pro.bd"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-sm hover:text-white transition-all text-center"
          >
            Services & Cover Page
          </a>
        </div>
      </div>
    </div>
  );
};
