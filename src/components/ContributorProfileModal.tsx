import React from 'react';
import { 
  X, 
  GraduationCap, 
  FileText, 
  Download, 
  Eye, 
  HardDrive
} from 'lucide-react';
import type { Contributor, StudyMaterial } from '../types';
import { getCategoryMeta } from '../types';

interface ContributorProfileModalProps {
  contributor: Contributor | null;
  materials: StudyMaterial[];
  onClose: () => void;
  onPreview: (material: StudyMaterial) => void;
}

export const ContributorProfileModal: React.FC<ContributorProfileModalProps> = ({
  contributor,
  materials,
  onClose,
  onPreview
}) => {
  if (!contributor) return null;

  const contributorUploads = materials.filter(
    (m) => m.uploader_id === contributor.uploader_id
  );

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
      <div className="relative w-full max-w-3xl bg-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-100">
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Contributor Profile Header Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-slate-800 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-purple-600/30 shrink-0">
            {contributor.name.charAt(0)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-2xl font-black text-white truncate">
                {contributor.name}
              </h2>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                {contributor.badge}
              </span>
            </div>

            {/* Department / Program details - strictly no student ID */}
            <div className="flex items-center gap-3 text-xs text-cyan-300 mt-1 font-semibold flex-wrap">
              {contributor.department && (
                <span className="flex items-center gap-1.5 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                  <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{contributor.department}</span>
                </span>
              )}
              {contributor.program && (
                <span className="flex items-center gap-1.5 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 text-indigo-300 font-mono">
                  <span>Program: {contributor.program}</span>
                </span>
              )}
              {!contributor.department && !contributor.program && (
                <span className="text-slate-400 italic">East West University Student Contributor</span>
              )}
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 bg-slate-800/60 sm:bg-transparent p-3 sm:p-0 rounded-xl">
            <span className="text-2xl font-black text-amber-400">{contributorUploads.length}</span>
            <span className="text-xs uppercase font-bold text-slate-400">Total Uploads</span>
          </div>
        </div>

        {/* Uploaded Materials Section */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" />
            <span>Contributions by {contributor.name} ({contributorUploads.length})</span>
          </h3>
        </div>

        {/* Scrollable list of uploaded items */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
          {contributorUploads.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No approved uploads available for this contributor yet.
            </div>
          ) : (
            contributorUploads.map((item) => {
              const categoryMeta = getCategoryMeta(item.file_type);
              const downloadUrl = `https://drive.google.com/uc?export=download&id=${item.drive_file_id}`;

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/60 transition-all gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black border ${categoryMeta.color}`}>
                        {categoryMeta.label}
                      </span>
                      <span className="font-mono font-black text-xs px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase">
                        {item.course_code}
                      </span>
                      {item.faculty_initial && item.faculty_initial !== 'GENERAL' && (
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 uppercase">
                          {item.faculty_initial}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">
                        {formatSemester(item.semester)}
                      </span>
                    </div>

                    <h4 
                      onClick={() => onPreview(item)}
                      className="font-bold text-sm text-slate-100 hover:text-purple-300 cursor-pointer transition-colors truncate"
                      title={item.file_name}
                    >
                      {item.file_name}
                    </h4>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
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
                      className="p-2 rounded-xl bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 transition-all text-xs font-black flex items-center gap-1"
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
      </div>
    </div>
  );
};
