import React from 'react';
import { X, Download, ExternalLink, FileText, HardDrive, Calendar, BookOpen } from 'lucide-react';
import type { StudyMaterial } from '../types';
import { CATEGORY_LABELS } from '../types';

interface FilePreviewModalProps {
  material: StudyMaterial | null;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ material, onClose }) => {
  if (!material) return null;

  const viewUrl = `https://drive.google.com/file/d/${material.drive_file_id}/preview`;
  const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${material.drive_file_id}`;
  const categoryMeta = CATEGORY_LABELS[material.file_type] || CATEGORY_LABELS.other;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-4">
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
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={directDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
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
              title="Open in Google Drive"
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

        {/* Embedded Document Viewer */}
        <div className="flex-1 bg-slate-950 relative">
          <iframe
            src={viewUrl}
            title={material.file_name}
            className="w-full h-full border-none"
            allow="autoplay"
          />
        </div>
      </div>
    </div>
  );
};
