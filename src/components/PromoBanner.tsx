import React, { useState } from 'react';
import { Smartphone, Sparkles, X, ChevronRight, Bell, Calendar, Award, Zap } from 'lucide-react';

interface PromoBannerProps {
  onOpenAppModal: () => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ onOpenAppModal }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside aria-label="EWUmate Companion App Announcement" className="relative z-40 bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-blue-900/90 border-b border-purple-500/30 backdrop-blur-md text-white px-4 py-2.5 shadow-lg shadow-purple-950/40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap text-xs md:text-sm font-medium">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 text-white shadow-md shadow-purple-500/30">
            <Sparkles className="h-4 w-4 animate-spin-slow" />
          </span>
          <div className="truncate">
            <span className="font-extrabold bg-gradient-to-r from-purple-200 to-indigo-100 bg-clip-text text-transparent">
              EWUmate Companion App:
            </span>{' '}
            <span className="text-purple-200 hidden sm:inline">
              Never miss a class! Smart class gap reminders, dynamic schedule tracker & CGPA calculator.
            </span>
            <span className="text-purple-200 sm:hidden">
              Class gap reminders & smart schedule tracker!
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <button
            onClick={onOpenAppModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-purple-950 font-black text-xs hover:bg-purple-50 active:scale-95 transition-all shadow-md hover:shadow-purple-500/20"
          >
            <Smartphone className="w-3.5 h-3.5 text-purple-600" />
            <span>Get EWUmate</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-purple-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
