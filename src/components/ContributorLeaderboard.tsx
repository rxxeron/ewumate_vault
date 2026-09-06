import React, { useState } from 'react';
import { 
  X, 
  Award, 
  Trophy, 
  Medal, 
  UploadCloud, 
  User, 
  ExternalLink,
  Sparkles,
  Smartphone
} from 'lucide-react';
import type { Contributor } from '../types';

interface ContributorLeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  contributors: Contributor[];
  onOpenUpload: () => void;
  onOpenAppModal: () => void;
}

export const ContributorLeaderboard: React.FC<ContributorLeaderboardProps> = ({
  isOpen,
  onClose,
  contributors,
  onOpenUpload,
  onOpenAppModal
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>Vault Hall of Fame</span>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Top Contributors
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Celebrating East West University students empowering their peers with study resources.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contributor List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
          {contributors.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No contributors recorded yet. Be the first student to upload!
            </div>
          ) : (
            contributors.map((c, index) => {
              const rank = index + 1;
              const isTop3 = rank <= 3;
              const rankBadgeColor = 
                rank === 1 ? 'bg-amber-500 text-black font-black' :
                rank === 2 ? 'bg-slate-300 text-slate-950 font-black' :
                rank === 3 ? 'bg-amber-700 text-amber-100 font-black' :
                'bg-slate-800 text-slate-400 font-bold';

              return (
                <div
                  key={c.uploader_id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/60 transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 shadow-sm ${rankBadgeColor}`}>
                      {rank}
                    </div>

                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-100 truncate">{c.name}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                          {c.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {c.student_id ? `ID: ${c.student_id}` : 'EWU Student'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3 text-right">
                    <div>
                      <div className="text-sm font-black text-amber-400">
                        {c.upload_count}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        {c.upload_count === 1 ? 'Upload' : 'Uploads'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer CTA */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400 text-center sm:text-left">
            Have past questions or notes? Upload to earn badges & help batchmates!
          </p>
          <button
            onClick={() => {
              onClose();
              onOpenUpload();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Material</span>
          </button>
        </div>
      </div>
    </div>
  );
};
