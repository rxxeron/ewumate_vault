import React, { useEffect, useState } from 'react';
import { X, Download, ExternalLink, FileText, Flag, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { StudyMaterial } from '../types';
import { getCategoryMeta } from '../types';
import { supabase } from '../lib/supabase';

interface FilePreviewModalProps {
  material: StudyMaterial | null;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ material, onClose }) => {
  const [hasReported, setHasReported] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [showReportSuccess, setShowReportSuccess] = useState(false);

  useEffect(() => {
    if (material?.id) {
      setHasReported(false);
      setShowReportSuccess(false);
      // Track view count
      supabase.rpc('increment_material_stat', {
        material_id: material.id,
        stat_type: 'view'
      }).then(() => {});
    }
  }, [material?.id]);

  if (!material) return null;

  const viewUrl = `https://drive.google.com/file/d/${material.drive_file_id}/preview`;
  const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${material.drive_file_id}`;
  const categoryMeta = getCategoryMeta(material.file_type);

  const handleDownloadClick = () => {
    supabase.rpc('increment_material_stat', {
      material_id: material.id,
      stat_type: 'download'
    }).then(() => {});
  };

  const handleReport = async () => {
    if (hasReported || isReporting) return;
    setIsReporting(true);
    try {
      await supabase.rpc('increment_material_stat', {
        material_id: material.id,
        stat_type: 'report'
      });
      setHasReported(true);
      setShowReportSuccess(true);
      setTimeout(() => setShowReportSuccess(false), 4000);
    } catch (err) {
      console.warn('Report failed:', err);
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h3 className="text-sm md:text-base font-bold text-white truncate" title={material.file_name}>
                {material.file_name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                <span className="text-indigo-400 font-bold">{material.course_code}</span>
                {material.faculty_initial && <span>• {material.faculty_initial}</span>}
                <span>• {material.semester}</span>
                <span className="text-purple-400">• {categoryMeta.label}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Report Button */}
            <button
              type="button"
              onClick={handleReport}
              disabled={hasReported || isReporting}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
                hasReported
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 cursor-default'
                  : 'bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border-slate-700/60'
              }`}
              title={hasReported ? 'Report submitted to moderators' : 'Report broken link or corrupted file'}
            >
              <Flag className={`w-3.5 h-3.5 ${hasReported ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span className="hidden sm:inline">{hasReported ? 'Reported' : 'Report'}</span>
            </button>

            <a
              href={directDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDownloadClick}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
            <a
              href={`https://drive.google.com/file/d/${material.drive_file_id}/view`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Open directly in Google Drive"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Confirmation Alert */}
        {showReportSuccess && (
          <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Thank you! The issue has been flagged for admin review.</span>
            </div>
          </div>
        )}

        {/* Embedded Document Viewer with Fallback Help */}
        <div className="flex-1 bg-slate-950 relative flex flex-col">
          <iframe
            src={viewUrl}
            title={material.file_name}
            className="w-full h-full border-none flex-1"
            allow="autoplay"
          />

          {/* Browser Cookie Help Strip */}
          <div className="py-1.5 px-4 bg-slate-900/90 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Blank preview? Browsers blocking 3rd-party cookies may restrict Drive embeds.</span>
            </span>
            <a
              href={`https://drive.google.com/file/d/${material.drive_file_id}/view`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:underline font-bold"
            >
              Open in Drive →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
