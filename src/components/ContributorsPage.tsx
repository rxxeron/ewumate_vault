import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Trophy, 
  Search, 
  GraduationCap, 
  ChevronRight, 
  UploadCloud, 
  Sparkles,
  Award,
  Layers,
  FileText
} from 'lucide-react';
import type { Contributor } from '../types';

interface ContributorsPageProps {
  contributors: Contributor[];
  onBack: () => void;
  onSelectContributor: (contributor: Contributor) => void;
  onOpenUpload: () => void;
}

export const ContributorsPage: React.FC<ContributorsPageProps> = ({
  contributors,
  onBack,
  onSelectContributor,
  onOpenUpload
}) => {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  // Distinct departments
  const departments = useMemo(() => {
    const depts = new Set<string>();
    contributors.forEach((c) => {
      if (c.department) depts.add(c.department);
    });
    return Array.from(depts).sort();
  }, [contributors]);

  // Filtered contributors
  const filteredContributors = useMemo(() => {
    return contributors.filter((c) => {
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesDept = (c.department || '').toLowerCase().includes(q);
        const matchesProg = (c.program || '').toLowerCase().includes(q);
        if (!matchesName && !matchesDept && !matchesProg) return false;
      }
      if (selectedDept !== 'all' && c.department !== selectedDept) return false;
      return true;
    });
  }, [contributors, search, selectedDept]);

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 animate-fade-in">
      {/* Top Bar navigation */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all text-xs font-bold shadow-sm active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Vault Archive</span>
        </button>

        <button
          onClick={onOpenUpload}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all active:scale-95"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Material</span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-purple-950/40 border border-purple-500/20 shadow-2xl mb-10 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-black uppercase tracking-wider mb-4">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Vault Hall of Fame</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            EWU Student <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">Contributors</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
            Empowering thousands of batchmates each semester. Explore our top contributors, see their departments, and click any profile to browse their uploaded questions, slides, and notes.
          </p>
        </div>
      </div>

      {/* Search & Department Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contributor by name or department..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
        </div>

        {departments.length > 0 && (
          <div className="w-full sm:w-auto">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:border-purple-500 transition-all"
            >
              <option value="all">All Departments ({departments.length})</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d.replace('Department of ', '')}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Contributor Cards Grid */}
      {filteredContributors.length === 0 ? (
        <div className="p-16 rounded-3xl bg-slate-900/40 border border-slate-800 text-center">
          <p className="text-slate-400 text-sm font-medium">No contributors found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredContributors.map((c, index) => {
            const rank = index + 1;
            const rankColor = 
              rank === 1 ? 'bg-amber-500 text-slate-950 font-black' :
              rank === 2 ? 'bg-slate-300 text-slate-950 font-black' :
              rank === 3 ? 'bg-amber-700 text-amber-100 font-black' :
              'bg-slate-800 text-slate-400 font-bold';

            return (
              <div
                key={c.uploader_id}
                onClick={() => onSelectContributor(c)}
                className="group relative flex flex-col justify-between p-6 rounded-3xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-purple-950/40"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shadow-sm ${rankColor}`}>
                      #{rank}
                    </div>

                    <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {c.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-3.5 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-purple-600/30 shrink-0">
                      {c.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-base text-white group-hover:text-purple-300 transition-colors truncate">
                        {c.name}
                      </h3>
                      <div className="text-xs text-cyan-400 font-medium truncate mt-0.5">
                        {c.department ? (
                          <span className="flex items-center gap-1 truncate">
                            <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{c.department.replace('Department of ', '')}</span>
                          </span>
                        ) : c.program ? (
                          <span className="text-indigo-300 font-mono">Program: {c.program}</span>
                        ) : (
                          <span className="text-slate-500">EWU Student</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between mt-4">
                  <div>
                    <span className="text-xl font-black text-amber-400">{c.upload_count}</span>
                    <span className="text-[11px] text-slate-400 uppercase font-bold ml-1.5">
                      {c.upload_count === 1 ? 'Upload' : 'Uploads'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-purple-400 group-hover:translate-x-1 transition-transform">
                    <span>View Materials</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
