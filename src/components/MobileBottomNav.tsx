import React from 'react';
import { Archive, Award, Upload, User, LogIn } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface MobileBottomNavProps {
  currentView: 'archive' | 'contributors' | 'upload';
  onNavigate: (view: 'archive' | 'contributors' | 'upload') => void;
  user: SupabaseUser | null;
  onOpenMyProfile: () => void;
  onOpenAuth: () => void;
  activeFiltersCount?: number;
  onOpenFilterDrawer?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigate,
  user,
  onOpenMyProfile,
  onOpenAuth
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 safe-area-pb">
      <div className="grid grid-cols-4 items-center gap-1 max-w-md mx-auto">
        {/* Archive Button */}
        <button
          onClick={() => onNavigate('archive')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all ${
            currentView === 'archive'
              ? 'text-purple-400 bg-purple-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Archive className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1">Archive</span>
        </button>

        {/* Contributors Button */}
        <button
          onClick={() => onNavigate('contributors')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all ${
            currentView === 'contributors'
              ? 'text-amber-400 bg-amber-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1">Contributors</span>
        </button>

        {/* Upload Button */}
        <button
          onClick={() => onNavigate('upload')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all ${
            currentView === 'upload'
              ? 'text-purple-300 bg-purple-600/30 font-black'
              : 'text-purple-400 hover:text-purple-300'
          }`}
        >
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
            <Upload className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-black mt-0.5 text-purple-300">Upload</span>
        </button>

        {/* Profile or Sign In Button */}
        {user ? (
          <button
            onClick={onOpenMyProfile}
            className="flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl text-slate-400 hover:text-purple-300 transition-all"
          >
            <div className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <User className="w-3 h-3" />
            </div>
            <span className="text-[10px] font-bold mt-1 truncate max-w-[64px]">
              Profile
            </span>
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl text-slate-400 hover:text-slate-200 transition-all"
          >
            <LogIn className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1">Sign In</span>
          </button>
        )}
      </div>
    </nav>
  );
};
