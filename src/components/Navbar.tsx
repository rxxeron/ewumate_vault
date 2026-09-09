import React from 'react';
import { 
  Vault, 
  Upload, 
  Smartphone, 
  Search, 
  User, 
  LogOut, 
  Award, 
  Archive
} from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface NavbarProps {
  user: SupabaseUser | null;
  currentView: 'archive' | 'contributors' | 'upload';
  onNavigate: (view: 'archive' | 'contributors' | 'upload') => void;
  onOpenMyProfile: () => void;
  onOpenUpload: () => void;
  onOpenAuth: () => void;
  onOpenAppModal: () => void;
  onSignOut: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalMaterialsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentView,
  onNavigate,
  onOpenMyProfile,
  onOpenUpload,
  onOpenAuth,
  onOpenAppModal,
  onSignOut,
  searchQuery,
  onSearchChange,
  totalMaterialsCount
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-4 shrink-0">
          <div 
            onClick={() => onNavigate('archive')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-lg shadow-purple-600/30 ring-1 ring-purple-400/30 group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="EWUmate" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-white">EWUmate</span>
                <span className="text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  Vault
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Public Materials Archive
              </p>
            </div>
          </div>

          {/* Navigation View Switcher */}
          <nav className="hidden sm:flex items-center gap-1 ml-4 pl-4 border-l border-slate-800">
            <button
              onClick={() => onNavigate('archive')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                currentView === 'archive'
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archive</span>
            </button>

            <button
              onClick={() => onNavigate('contributors')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                currentView === 'contributors'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Contributors</span>
            </button>

            <button
              onClick={() => onNavigate('upload')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                currentView === 'upload'
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-purple-400" />
              <span>Upload Materials</span>
            </button>
          </nav>
        </div>

        {/* Global Instant Search (Archive view only) */}
        {currentView === 'archive' && (
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
        )}

        {/* Nav Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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
            onClick={() => onNavigate('upload')}
            className={`hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black shadow-lg transition-all active:scale-95 ${
              currentView === 'upload'
                ? 'bg-purple-600 text-white ring-2 ring-purple-400/50 shadow-purple-600/40'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/25'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </button>

          {/* Auth State Button */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <button
                onClick={onOpenMyProfile}
                className="flex items-center gap-1.5 text-xs text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 px-3 py-1.5 rounded-xl max-w-[160px] truncate transition-all active:scale-95 shadow-sm"
                title="Click to view your contributor profile & semester breakdown"
              >
                <User className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="truncate font-semibold">{user.email?.split('@')[0]}</span>
              </button>
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
