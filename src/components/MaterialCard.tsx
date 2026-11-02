import React from 'react';
import { 
  Download, 
  Eye, 
  FileText, 
  GraduationCap, 
  Calendar, 
  User, 
  HardDrive,
  BookOpen,
  Bookmark,
  ThumbsUp
} from 'lucide-react';
import type { StudyMaterial } from '../types';
import { getCategoryMeta } from '../types';
import { supabase } from '../lib/supabase';

interface MaterialCardProps {
  material: StudyMaterial;
  isBookmarked?: boolean;
  onToggleBookmark?: (materialId: string) => void;
  onPreview: (material: StudyMaterial) => void;
  onSelectCourse: (course: string) => void;
  onSelectFaculty: (faculty: string) => void;
  onSelectSemester?: (semester: string) => void;
  onOpenContributor: (uploaderId: string, name: string) => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  isBookmarked = false,
  onToggleBookmark,
  onPreview,
  onSelectCourse,
  onSelectFaculty,
  onSelectSemester,
  onOpenContributor
}) => {
  const handleDownloadClick = () => {
    try {
      supabase.rpc('increment_material_stat', {
        material_id: material.id,
        stat_type: 'download'
      }).then(() => {});
    } catch {}
  };

  const handlePreviewClick = () => {
    onPreview(material);
    try {
      supabase.rpc('increment_material_stat', {
        material_id: material.id,
        stat_type: 'view'
      }).then(() => {});
    } catch {}
  };

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

  const categoryMeta = getCategoryMeta(material.file_type);
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${material.drive_file_id}`;

  return (
    <div className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-3xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-purple-500/40 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-purple-950/30 overflow-hidden">
      <div className="flex-1 flex flex-col">
        {/* Top Header: Category Tag & Bookmark */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black border ${categoryMeta.color} max-w-[calc(100%-40px)]`}>
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{categoryMeta.label}</span>
          </span>

          {onToggleBookmark && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(material.id);
              }}
              className={`p-1.5 rounded-lg border transition-all shrink-0 ${
                isBookmarked
                  ? 'bg-amber-400/20 text-amber-400 border-amber-400/40 shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white border-slate-700/60 hover:bg-slate-800'
              }`}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark this material'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
            </button>
          )}
        </div>

        {/* File Name */}
        <h3 
          onClick={handlePreviewClick}
          className="font-bold text-base text-slate-100 group-hover:text-purple-300 transition-colors cursor-pointer line-clamp-2 leading-snug mb-3"
          title={material.file_name}
        >
          {material.file_name}
        </h3>

        {/* Contributor Row (Full width, clear & legible) */}
        <div className="mb-3.5">
          {material.uploader_name && material.uploader_id ? (
            <button
              onClick={() => onOpenContributor(material.uploader_id!, material.uploader_name!)}
              className="flex items-center gap-2 text-left hover:text-purple-300 transition-colors group/contrib max-w-full"
              title={`View ${material.uploader_name}'s profile & contributions`}
            >
              <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0 group-hover/contrib:border-purple-400 group-hover/contrib:scale-105 transition-all">
                <User className="w-3 h-3 text-purple-300" />
              </div>
              <div className="min-w-0 flex-1 truncate">
                <span className="font-semibold text-xs text-slate-200 group-hover/contrib:text-purple-300 truncate block leading-tight">
                  {material.uploader_name}
                </span>
                {material.uploader_department && (
                  <span className="text-[10px] text-slate-400 truncate block leading-tight mt-0.5">
                    {material.uploader_department.replace('Department of ', '')}
                  </span>
                )}
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center shrink-0">
                <User className="w-3 h-3 text-slate-400" />
              </div>
              <span className="text-xs italic text-slate-400 truncate">EWU Community</span>
            </div>
          )}
        </div>

        {/* Interactive Tags: Course Code, Faculty Initial, Semester & File Size */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4 mt-auto">
          <button
            onClick={() => onSelectCourse(material.course_code)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-xs font-mono font-black uppercase transition-colors"
            title={`Filter by ${material.course_code}`}
          >
            <BookOpen className="w-3 h-3" />
            <span>{material.course_code}</span>
          </button>

          {material.faculty_initial && material.faculty_initial !== 'GENERAL' && (
            <button
              onClick={() => onSelectFaculty(material.faculty_initial)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 text-xs font-mono font-bold uppercase transition-colors"
              title={`Filter by faculty ${material.faculty_initial}`}
            >
              <GraduationCap className="w-3 h-3" />
              <span>{material.faculty_initial}</span>
            </button>
          )}

          {material.semester && (
            <button
              onClick={() => onSelectSemester ? onSelectSemester(material.semester) : undefined}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-semibold transition-colors ${
                onSelectSemester ? 'hover:bg-emerald-500/20 cursor-pointer' : ''
              }`}
              title={onSelectSemester ? `Filter by semester ${formatSemester(material.semester)}` : formatSemester(material.semester)}
            >
              <Calendar className="w-3 h-3 text-emerald-400" />
              <span>{formatSemester(material.semester)}</span>
            </button>
          )}

          {/* Social Proof (if upvotes exist) */}
          {(material.helpful_count || 0) > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
              <ThumbsUp className="w-2.5 h-2.5 fill-emerald-400" />
              <span>{material.helpful_count}</span>
            </span>
          )}

          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 ml-auto">
            <HardDrive className="w-3 h-3 text-slate-500" />
            {formatBytes(material.file_size_bytes)}
          </span>
        </div>
      </div>

      {/* Footer: Direct Action Buttons (Symmetrical 2-Column Grid) */}
      <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 mt-auto">
        <button
          onClick={handlePreviewClick}
          className="py-2 px-3 rounded-xl bg-slate-800/90 hover:bg-purple-600 hover:text-white text-slate-300 transition-all text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700/60 hover:border-purple-600 shadow-sm"
          title="Preview file in browser"
        >
          <Eye className="w-3.5 h-3.5 shrink-0" />
          <span>Preview</span>
        </button>

        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleDownloadClick}
          className="py-2 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 hover:border-purple-600 transition-all text-xs font-black flex items-center justify-center gap-1.5 shadow-sm"
          title="Download file directly"
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span>Download</span>
        </a>
      </div>
    </div>
  );
};
