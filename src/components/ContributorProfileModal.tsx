import React, { useState, useMemo } from 'react';
import { 
  X, 
  GraduationCap, 
  FileText, 
  Download, 
  Eye, 
  HardDrive, 
  Trophy, 
  Calendar, 
  Layers, 
  Sparkles, 
  Award, 
  Filter, 
  UploadCloud,
  IdCard
} from 'lucide-react';
import type { Contributor, StudyMaterial } from '../types';
import { getCategoryMeta } from '../types';

interface ContributorProfileModalProps {
  contributor: Contributor | null;
  allContributors: Contributor[];
  materials: StudyMaterial[];
  onClose: () => void;
  onPreview: (material: StudyMaterial) => void;
  onOpenUpload?: () => void;
}

export const ContributorProfileModal: React.FC<ContributorProfileModalProps> = ({
  contributor,
  allContributors,
  materials,
  onClose,
  onPreview,
  onOpenUpload
}) => {
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Filter materials uploaded by this contributor
  const contributorUploads = useMemo(() => {
    if (!contributor) return [];
    return materials.filter((m) => m.uploader_id === contributor.uploader_id);
  }, [materials, contributor?.uploader_id]);

  // Standing / Rank calculation (use explicit rank from prop if available, or find in allContributors)
  const standingIndex = useMemo(() => {
    if (!contributor) return null;
    if (contributor.rank !== undefined && contributor.rank !== null) return contributor.rank;
    const idx = allContributors.findIndex(c => c.uploader_id === contributor.uploader_id);
    return idx !== -1 ? idx + 1 : null;
  }, [allContributors, contributor?.uploader_id, contributor?.rank]);

  // Semester breakdown
  const semesterBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    contributorUploads.forEach((m) => {
      if (m.semester) {
        map.set(m.semester, (map.get(m.semester) || 0) + 1);
      }
    });
    return Array.from(map.entries())
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count);
  }, [contributorUploads]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    contributorUploads.forEach((m) => {
      if (m.file_type) {
        map.set(m.file_type, (map.get(m.file_type) || 0) + 1);
      }
    });
    return Array.from(map.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }, [contributorUploads]);

  // Filtered uploads according to tab selection
  const filteredUploads = useMemo(() => {
    return contributorUploads.filter((m) => {
      if (selectedSemesterFilter !== 'all' && m.semester !== selectedSemesterFilter) return false;
      if (selectedCategoryFilter !== 'all' && m.file_type !== selectedCategoryFilter) return false;
      return true;
    });
  }, [contributorUploads, selectedSemesterFilter, selectedCategoryFilter]);

  // Safe early exit AFTER all hooks have executed
  if (!contributor) return null;

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes === 0) return 'File';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatSemester = (sem: string) => {
    if (!sem) return 'N/A';
    return sem.replace(/^(spring|summer|fall)(\d{4})$/i, (_, season, year) => {
      return season.charAt(0).toUpperCase() + season.slice(1).toLowerCase() + ' ' + year;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-purple-500/30 rounded-3xl p-5 sm:p-8 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 pb-5 border-b border-slate-800 mb-5">
          {/* Avatar / Photo */}
          {contributor.photo_url ? (
            <img 
              src={contributor.photo_url} 
              alt={contributor.name || 'Student'}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-purple-400/40 shadow-lg shadow-purple-600/30 shrink-0"
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-black shadow-lg shadow-purple-600/30 shrink-0 ring-2 ring-purple-400/20">
              {(contributor.name?.trim() ? contributor.name.trim().charAt(0) : 'E').toUpperCase()}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-white truncate">
                {contributor.name || 'EWU Student'}
              </h2>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>{contributor.badge}</span>
              </span>
            </div>

            {/* Department / Program details */}
            <div className="flex items-center gap-2 text-xs text-cyan-300 mt-1.5 font-semibold flex-wrap">
              {contributor.department && (
                <span className="flex items-center gap-1 bg-cyan-500/10 px-2.5 py-0.5 rounded-lg border border-cyan-500/20">
                  <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="truncate">{contributor.department.replace('Department of ', '')}</span>
                </span>
              )}
              {contributor.program && (
                <span className="bg-indigo-500/10 px-2.5 py-0.5 rounded-lg border border-indigo-500/20 text-indigo-300 font-mono">
                  {contributor.program}
                </span>
              )}
              {!contributor.department && !contributor.program && (
                <span className="text-slate-400 italic">East West University Contributor</span>
              )}
            </div>
          </div>

          {/* Quick Metrics: Total Uploads & Standings */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-between sm:justify-end mt-1 sm:mt-0">
            {standingIndex ? (
              <div className="p-2.5 sm:p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center min-w-[85px] sm:min-w-[95px]">
                <div className="flex items-center justify-center gap-1 text-amber-400">
                  <Trophy className="w-4 h-4" />
                  <span className="text-lg sm:text-xl font-black">#{standingIndex}</span>
                </div>
                <div className="text-[10px] uppercase font-bold text-amber-300/80 mt-0.5">
                  Leaderboard
                </div>
              </div>
            ) : null}

            <div className="p-2.5 sm:p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center min-w-[85px] sm:min-w-[95px]">
              <div className="text-lg sm:text-xl font-black text-purple-300">
                {contributorUploads.length}
              </div>
              <div className="text-[10px] uppercase font-bold text-purple-300/80 mt-0.5">
                Total Uploads
              </div>
            </div>
          </div>
        </div>

        {/* Empty State: If user has 0 uploads */}
        {contributorUploads.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 text-center my-auto">
            <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/10">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No Materials Uploaded Yet</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed mb-6">
              You haven't uploaded any study materials to the vault yet. Upload mid & final questions, slides, or lecture notes to earn contributor badges and help fellow students!
            </p>

            {onOpenUpload && (
              <button
                onClick={() => {
                  onClose();
                  onOpenUpload();
                }}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-purple-600/30 hover:opacity-95 active:scale-95 transition-all"
              >
                Upload Course Materials Now →
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Semester-by-Semester Breakdown Cards */}
            <div className="mb-4 p-3.5 sm:p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Semester Breakdown</span>
                </h4>
                <span className="text-[11px] text-slate-400 font-medium">
                  {semesterBreakdown.length} active semesters
                </span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                <button
                  onClick={() => setSelectedSemesterFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedSemesterFilter === 'all'
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  All ({contributorUploads.length})
                </button>

                {semesterBreakdown.map((s) => {
                  const isSelected = selectedSemesterFilter === s.code;
                  return (
                    <button
                      key={s.code}
                      onClick={() => setSelectedSemesterFilter(isSelected ? 'all' : s.code)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{formatSemester(s.code)}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-900 text-emerald-400 font-mono font-bold">
                        {s.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Material Type Pills Filter */}
            <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 custom-scrollbar text-xs">
              <span className="text-slate-400 font-bold flex items-center gap-1 whitespace-nowrap mr-1">
                <Filter className="w-3 h-3 text-purple-400" /> Type:
              </span>

              <button
                onClick={() => setSelectedCategoryFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                  selectedCategoryFilter === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>

              {categoryBreakdown.map((c) => {
                const meta = getCategoryMeta(c.type);
                const isSelected = selectedCategoryFilter === c.type;
                return (
                  <button
                    key={c.type}
                    onClick={() => setSelectedCategoryFilter(isSelected ? 'all' : c.type)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
                      isSelected
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{meta.label}</span>
                    <span className="text-[10px] text-purple-400 font-mono">({c.count})</span>
                  </button>
                );
              })}
            </div>

            {/* Scrollable Material Items List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2.5 pr-1 min-h-[160px]">
              {filteredUploads.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No materials match the selected filters.
                </div>
              ) : (
                filteredUploads.map((item) => {
                  const categoryMeta = getCategoryMeta(item.file_type);
                  const downloadUrl = `https://drive.google.com/uc?export=download&id=${item.drive_file_id}`;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-2xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/60 transition-all gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${categoryMeta.color}`}>
                            {categoryMeta.label}
                          </span>
                          <span className="font-mono font-black text-[11px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase">
                            {item.course_code}
                          </span>
                          {item.faculty_initial && item.faculty_initial !== 'GENERAL' && (
                            <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 uppercase">
                              {item.faculty_initial}
                            </span>
                          )}
                          <span className="text-[11px] text-emerald-400/90 font-medium">
                            {formatSemester(item.semester)}
                          </span>
                        </div>

                        <h4 
                          onClick={() => onPreview(item)}
                          className="font-bold text-xs sm:text-sm text-slate-100 hover:text-purple-300 cursor-pointer transition-colors truncate"
                          title={item.file_name}
                        >
                          {item.file_name}
                        </h4>

                        <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-slate-400 mt-1">
                          <span className="flex items-center gap-1 font-semibold">
                            <HardDrive className="w-3 h-3 text-slate-400" />
                            {formatBytes(item.file_size_bytes)}
                          </span>
                          <span>•</span>
                          <span>Uploaded {new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => onPreview(item)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>
                        <a
                          href={downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 transition-all text-xs font-black flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
