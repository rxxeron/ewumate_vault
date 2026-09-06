import React from 'react';
import { 
  Vault, 
  Upload, 
  Smartphone, 
  Search, 
  User, 
  LogOut, 
  Award, 
  Sparkles,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface NavbarProps {
  user: SupabaseUser | null;
  onOpenUpload: () => void;
  onOpenAuth: () => void;
  onOpenAppModal: () => void;
  onOpenLeaderboard: () => void;
  onSignOut: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalMaterialsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenUpload,
  onOpenAuth,
  onOpenAppModal,
  onOpenLeaderboard,
  onSignOut,
  searchQuery,
  onSearchChange,
  totalMaterialsCount
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-800 flex items-center justify-center shadow-lg shadow-purple-600/30 ring-1 ring-purple-400/30">
            <Vault className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-white">EWUmate</span>
              <span className="text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30">
                Vault
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Public Question & Materials Archive
            </p>
          </div>
        </div>

        {/* Global Instant Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search course code (CSE106), faculty, or question..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-800/80 border border-slate-700/80 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>
        </div>

        {/* Nav Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Top Contributors Button */}
          <button
            onClick={onOpenLeaderboard}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-all"
            title="View Top Contributors"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Contributors</span>
          </button>

          {/* EWUmate App CTA */}
          <button
            onClick={onOpenAppModal}
            className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-purple-300 hover:text-purple-200 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-all"
          >
            <Smartphone className="w-3.5 h-3.5 text-purple-400" />
            <span>EWUmate App</span>
          </button>

          {/* Upload Button */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-purple-600/25 active:scale-95 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </button>

          {/* Auth State Button */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div 
                className="flex items-center gap-1.5 text-xs text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1.5 rounded-xl max-w-[150px] truncate"
                title={user.email}
              >
                <User className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="truncate font-semibold">{user.email?.split('@')[0]}</span>
              </div>
              <button
                onClick={onSignOut}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-slate-800 border border-slate-700/80 transition-all"
            >
              <User className="w-3.5 h-3.5 text-purple-400" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
