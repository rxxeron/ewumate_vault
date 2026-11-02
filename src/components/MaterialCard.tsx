import React, { useState, useEffect } from 'react';
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
  onOpenContributor: (uploaderId: string, name: string) => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  isBookmarked = false,
  onToggleBookmark,
  onPreview,
  onSelectCourse,
  onSelectFaculty,
  onOpenContributor
}) => {
  const [helpfulCount, setHelpfulCount] = useState<number>(material.helpful_count || 0);
  const [hasVotedHelpful, setHasVotedHelpful] = useState<boolean>(false);

  useEffect(() => {
    try {
      const voted = localStorage.getItem(`ewumate_vault_helpful_${material.id}`);
      if (voted === 'true') {
        setHasVotedHelpful(true);
      }
    } catch {}
  }, [material.id]);

  const handleHelpfulClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasVotedHelpful) return;

    setHasVotedHelpful(true);
    setHelpfulCount(prev => prev + 1);

    try {
      localStorage.setItem(`ewumate_vault_helpful_${material.id}`, 'true');
      await supabase.rpc('increment_material_stat', {
        material_id: material.id,
        stat_type: 'helpful'
      });
    } catch (err) {
      console.warn('Could not record helpful vote:', err);
    }
  };

  const handleDownloadClick = async () => {
    try {
      await supabase.rpc('increment_material_stat', {
        material_id: material.id,
        stat_type: 'download'
      });
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
    <div className="group relative flex flex-col justify-between p-5 rounded-3xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-purple-500/40 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-purple-950/30">
      <div>
        {/* Top Header: Category Tag & Semester & Bookmark */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black border ${categoryMeta.color}`}>
            <FileText className="w-3.5 h-3.5" />
            <span>{categoryMeta.label}</span>
          </span>

          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-md">
              <Calendar className="w-3 h-3 text-emerald-400" />
              <span>{formatSemester(material.semester)}</span>
            </span>

            {onToggleBookmark && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(material.id);
                }}
                className={`p-1.5 rounded-lg border transition-all ${
                  isBookmarked
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white border-slate-700/60 hover:bg-slate-800'
                }`}
                title={isBookmarked ? 'Remove from Saved Bookmarks' : 'Save material for quick study'}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* File Name */}
        <h3 
          onClick={handlePreviewClick}
          className="font-bold text-base text-slate-100 group-hover:text-purple-300 transition-colors cursor-pointer line-clamp-2 leading-snug mb-3"
          title={material.file_name}
        >
          {material.file_name}
        </h3>

        {/* Interactive Tags: Course Code & Faculty Initial */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
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

          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 ml-auto">
            <HardDrive className="w-3 h-3 text-slate-400" />
            {formatBytes(material.file_size_bytes)}
          </span>
        </div>
      </div>

      {/* Footer: Contributor, Helpful Counter & Actions */}
      <div className="pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
          {material.uploader_name && material.uploader_id ? (
            <button
              onClick={() => onOpenContributor(material.uploader_id!, material.uploader_name!)}
              className="flex items-center gap-1 text-left hover:text-purple-300 transition-colors group/contrib truncate"
              title={`View ${material.uploader_name}'s profile & contributions`}
            >
              <User className="w-3 h-3 text-purple-400 shrink-0 group-hover/contrib:scale-110 transition-transform" />
              <div className="truncate">
                <span className="font-semibold truncate block">{material.uploader_name}</span>
                {material.uploader_department && (
                  <span className="text-[10px] text-cyan-400/80 truncate block">
                    {material.uploader_department.replace('Department of ', '')}
                  </span>
                )}
              </div>
            </button>
          ) : (
            <span className="italic text-slate-400">EWU Community</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Helpful Upvote Button */}
          <button
            type="button"
            onClick={handleHelpfulClick}
            disabled={hasVotedHelpful}
            className={`px-2 py-1 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition-all ${
              hasVotedHelpful
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 cursor-default'
                : 'bg-slate-800/60 hover:bg-emerald-500/15 text-slate-400 hover:text-emerald-400 border-slate-700/60'
            }`}
            title={hasVotedHelpful ? 'You marked this as helpful' : 'Mark as helpful for other students'}
          >
            <ThumbsUp className={`w-3 h-3 ${hasVotedHelpful ? 'fill-emerald-400 text-emerald-400' : ''}`} />
            <span>{helpfulCount > 0 ? helpfulCount : 'Helpful'}</span>
          </button>

          <button
            onClick={handlePreviewClick}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-purple-600 hover:text-white text-slate-300 transition-all text-xs font-bold flex items-center gap-1"
            title="Preview file in browser"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </button>

          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDownloadClick}
            className="p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 hover:border-purple-600 transition-all text-xs font-black flex items-center gap-1 shadow-sm"
            title="Download file directly"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>
        </div>
      </div>
    </div>
  );
};
