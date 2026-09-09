import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  GraduationCap, 
  BookOpen, 
  Smartphone,
  Calendar,
  Layers,
  Trash2,
  Check
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { FILE_TYPES, getCategoryMeta } from '../types';
import { computeFileHash } from '../lib/hash';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onRequireAuth: () => void;
  onOpenAppModal: () => void;
  onUploadSuccess: () => void;
}

interface UploadItem {
  file: File;
  fileType: string;
  semester: string;
  progress: number;
  status: 'pending' | 'uploading' | 'saving' | 'done' | 'failed';
  error?: string;
  isDuplicate?: boolean;
  fileHash?: string;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  user,
  onRequireAuth,
  onOpenAppModal,
  onUploadSuccess
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global Default Form Settings
  const [defaultSemester, setDefaultSemester] = useState('summer2026');
  const [defaultFileType, setDefaultFileType] = useState('Mid Question');
  const [courseCode, setCourseCode] = useState('');
  const [facultyInitial, setFacultyInitial] = useState('');

  // Bulk File List with individual metadata
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Autocomplete suggestions
  const [semesterOptions, setSemesterOptions] = useState<{ code: string; title: string }[]>([]);
  const [courseSuggestions, setCourseSuggestions] = useState<{ code: string; name: string }[]>([]);
  const [showCourseSuggestions, setShowCourseSuggestions] = useState(false);

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  useEffect(() => {
    fetchSemesters();
  }, []);

  // Course autocomplete
  useEffect(() => {
    if (courseCode.trim().length < 2) {
      setCourseSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const q = courseCode.trim();
        const { data } = await supabase
          .from('course_metadata')
          .select('code, name')
          .or(`code.ilike.%${q}%,name.ilike.%${q}%`)
          .limit(5);
        if (data) setCourseSuggestions(data);
      } catch (e) {
        console.error(e);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [courseCode]);

  const fetchSemesters = async () => {
    try {
      const { data } = await supabase
        .from('semesters')
        .select('code, title')
        .order('code', { ascending: false });
      if (data && data.length > 0) {
        setSemesterOptions(data);
        setDefaultSemester(data[0].code);
      } else {
        const fallbacks = [
          { code: 'summer2026', title: 'Summer 2026' },
          { code: 'spring2026', title: 'Spring 2026' },
          { code: 'fall2025', title: 'Fall 2025' }
        ];
        setSemesterOptions(fallbacks);
        setDefaultSemester(fallbacks[0].code);
      }
    } catch (e) {
      const fallbacks = [
        { code: 'summer2026', title: 'Summer 2026' },
        { code: 'spring2026', title: 'Spring 2026' },
        { code: 'fall2025', title: 'Fall 2025' }
      ];
      setSemesterOptions(fallbacks);
      setDefaultSemester(fallbacks[0].code);
    }
  };

  if (!isOpen) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
        <div className="relative w-full max-w-md bg-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center mx-auto mb-4">
            <Upload className="w-7 h-7" />
          </div>

          <h3 className="text-xl font-black text-white mb-2">Student Login Required</h3>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            To maintain verified high-quality study materials, uploading requires an East West University student email (<span className="text-purple-300 font-mono">@std.ewubd.edu</span>).
          </p>

          <div className="space-y-3">
            <button
              onClick={() => {
                onClose();
                onRequireAuth();
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-sm shadow-lg shadow-purple-600/30 hover:opacity-95 active:scale-95 transition-all"
            >
              Sign In with EWU Student Email
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs transition-colors"
            >
              Cancel & Continue Browsing
            </button>
          </div>
        </div>
      </div>
    );
  }

  const addFiles = (newFiles: File[]) => {
    setUploadItems(prev => {
      const updated = [...prev];
      newFiles.forEach(file => {
        // Prevent duplicates
        if (!updated.some(item => item.file.name === file.name && item.file.size === file.size)) {
          updated.push({
            file,
            fileType: defaultFileType,
            semester: defaultSemester,
            progress: 0,
            status: 'pending'
          });
        }
      });
      return updated;
    });
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (idx: number) => {
    setUploadItems(prev => prev.filter((_, i) => i !== idx));
  };

  const updateItemSemester = (idx: number, sem: string) => {
    setUploadItems(prev => {
      const next = [...prev];
      next[idx].semester = sem;
      return next;
    });
  };

  const updateItemFileType = (idx: number, type: string) => {
    setUploadItems(prev => {
      const next = [...prev];
      next[idx].fileType = type;
      return next;
    });
  };

  // Bulk Apply Settings to all files
  const applyDefaultsToAll = () => {
    setUploadItems(prev => prev.map(item => ({
      ...item,
      semester: defaultSemester,
      fileType: defaultFileType
    })));
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (uploadItems.length === 0) {
      setErrorMessage('Please select at least one file to upload.');
      return;
    }
    if (!courseCode.trim()) {
      setErrorMessage('Please provide a course code (e.g. CSE106).');
      return;
    }

    setIsUploading(true);
    setOverallProgress(10);

    try {
      const cleanCourse = courseCode.trim().replace(/\s+/g, '').toUpperCase();
      const cleanFaculty = facultyInitial.trim().replace(/[^a-zA-Z]/g, '').toUpperCase();
      let completedCount = 0;

      for (let i = 0; i < uploadItems.length; i++) {
        const item = uploadItems[i];

        // Skip already completed files (prevents duplicate re-uploads on retry)
        if (item.status === 'done') {
          completedCount++;
          setOverallProgress(Math.round((completedCount / uploadItems.length) * 100));
          continue;
        }

        try {
          // Mark item uploading and compute hash
          setUploadItems(prev => {
            const next = [...prev];
            next[i].status = 'uploading';
            next[i].progress = 15;
            next[i].error = undefined;
            return next;
          });

          const fileHash = await computeFileHash(item.file);

          // Check if file already exists in vault
          let existingRecord: any = null;

          // Check A: by file_hash
          try {
            const { data: hashMatch, error: hashErr } = await supabase
              .from('study_materials')
              .select('id, drive_file_id, drive_account_id, file_name, course_code')
              .eq('file_hash', fileHash)
              .limit(1)
              .maybeSingle();

            if (!hashErr && hashMatch) {
              existingRecord = hashMatch;
            }
          } catch {
            // Ignore column check fallback
          }

          // Check B: by course_code + file_name + file_size_bytes
          if (!existingRecord) {
            try {
              const { data: nameMatch, error: nameErr } = await supabase
                .from('study_materials')
                .select('id, drive_file_id, drive_account_id, file_name, course_code')
                .eq('course_code', cleanCourse)
                .eq('file_name', item.file.name)
                .eq('file_size_bytes', item.file.size)
                .limit(1)
                .maybeSingle();

              if (!nameErr && nameMatch) {
                existingRecord = nameMatch;
              }
            } catch {
              // Ignore fallback check failure
            }
          }

          let driveFileId = 'fallback-local-' + Date.now();
          let driveAccountId = 'primary';
          let isDuplicate = false;

          if (existingRecord) {
            // Duplicate detected -> Reuse Drive file ID, skip re-uploading file bytes
            driveFileId = existingRecord.drive_file_id || driveFileId;
            driveAccountId = existingRecord.drive_account_id || driveAccountId;
            isDuplicate = true;
          } else {
            // Upload file to Google Drive
            setUploadItems(prev => {
              const next = [...prev];
              next[i].progress = 45;
              return next;
            });

            try {
              const { data: edgeData, error: edgeError } = await supabase.functions.invoke('get-drive-upload-url', {
                body: {
                  fileName: item.file.name,
                  fileSizeBytes: item.file.size,
                  fileHash: fileHash,
                  courseCode: cleanCourse,
                  mimeType: item.file.type || 'application/octet-stream'
                }
              });

              if (!edgeError && edgeData) {
                if (edgeData.isDuplicate && edgeData.driveFileId) {
                  driveFileId = edgeData.driveFileId;
                  if (edgeData.driveAccountId) driveAccountId = edgeData.driveAccountId;
                  isDuplicate = true;
                } else if (edgeData.uploadUrl) {
                  const driveRes = await fetch(edgeData.uploadUrl, {
                    method: 'PUT',
                    body: item.file
                  });

                  if (driveRes.ok) {
                    const resText = await driveRes.text();
                    try {
                      const parsed = JSON.parse(resText);
                      if (parsed.id) driveFileId = parsed.id;
                    } catch {
                      const match = resText.match(/"id":\s*"([^"]+)"/);
                      if (match) driveFileId = match[1];
                    }
                    if (edgeData.driveAccountId) driveAccountId = edgeData.driveAccountId;
                  }
                }
              }
            } catch (edgeErr) {
              console.warn('Direct drive edge invocation notice:', edgeErr);
            }
          }

          // Save metadata to study_materials with individual file's semester & file_type
          setUploadItems(prev => {
            const next = [...prev];
            next[i].status = 'saving';
            next[i].progress = 85;
            return next;
          });

          const basePayload: any = {
            uploader_id: user.id,
            faculty_initial: cleanFaculty || 'GENERAL',
            course_code: cleanCourse,
            semester: item.semester,
            file_type: item.fileType,
            drive_account_id: driveAccountId,
            drive_file_id: driveFileId,
            file_name: item.file.name,
            file_size_bytes: item.file.size,
            status: 'approved'
          };

          let insertError: any = null;
          try {
            const { error } = await supabase
              .from('study_materials')
              .insert({ ...basePayload, file_hash: fileHash });
            insertError = error;
          } catch (err) {
            insertError = err;
          }

          // Fallback if file_hash column is not present
          if (insertError && (insertError.message?.includes('column "file_hash"') || insertError.code === '42703')) {
            const { error: fallbackError } = await supabase
              .from('study_materials')
              .insert(basePayload);
            insertError = fallbackError;
          }

          if (insertError) throw insertError;

          completedCount++;
          setUploadItems(prev => {
            const next = [...prev];
            next[i].status = 'done';
            next[i].progress = 100;
            next[i].isDuplicate = isDuplicate;
            next[i].fileHash = fileHash;
            return next;
          });

          setOverallProgress(Math.round((completedCount / uploadItems.length) * 100));
        } catch (itemErr: any) {
          console.error(`Upload error for ${item.file.name}:`, itemErr);
          // Mark this individual item as failed so other items can finish
          setUploadItems(prev => {
            const next = [...prev];
            next[i].status = 'failed';
            next[i].progress = 0;
            next[i].error = itemErr.message || 'Upload failed';
            return next;
          });
        }
      }

      if (completedCount > 0) {
        setSuccessCount(completedCount);
        onUploadSuccess();
      } else {
        setErrorMessage('Failed to upload files. Please check your network and retry.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Bulk upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {successCount !== null ? (
          <div className="text-center py-6 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-white mb-2">
              Bulk Upload Complete!
            </h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto mb-6">
              Successfully contributed <strong className="text-emerald-400">{successCount}</strong> study materials to the EWUmate Vault!
            </p>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-900/60 to-indigo-900/60 border border-purple-500/30 text-left mb-6 relative overflow-hidden">
              <div className="flex items-center gap-2 text-purple-300 font-extrabold text-xs uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Next Step: Boost Your Semester</span>
              </div>
              <h4 className="font-black text-white text-base mb-1">
                Have you tried the EWUmate Companion App?
              </h4>
              <p className="text-xs text-purple-200 leading-relaxed mb-4">
                Automate your daily schedule, get gap alerts before class, predict CGPA requirements, and simplify section advising in seconds.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenAppModal();
                }}
                className="w-full py-2.5 rounded-xl bg-white text-purple-950 font-black text-xs hover:bg-purple-50 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                <Smartphone className="w-4 h-4 text-purple-700" />
                <span>Open EWUmate App Features</span>
              </button>
            </div>

            <button
              onClick={() => {
                setSuccessCount(null);
                setUploadItems([]);
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
            >
              Done & Return to Vault
            </button>
          </div>
        ) : (
          <div>
            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <span>Bulk Upload Study Materials</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Multi-file
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Uploading as <span className="text-purple-400 font-semibold">{user.email}</span>
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-6">
              {/* Section 1: Course & Faculty Details */}
              <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>1. Course & Faculty Target</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Course Code with Autocomplete */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Course Code (e.g. CSE106, MAT101) *
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={courseCode}
                        onChange={(e) => {
                          setCourseCode(e.target.value.toUpperCase());
                          setShowCourseSuggestions(true);
                        }}
                        placeholder="CSE106"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono font-bold uppercase focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      />
                    </div>

                    {showCourseSuggestions && courseSuggestions.length > 0 && (
                      <div className="absolute z-30 top-full mt-1 w-full rounded-xl bg-slate-800 border border-slate-700 shadow-xl overflow-hidden">
                        {courseSuggestions.map((c) => (
                          <button
                            type="button"
                            key={c.code}
                            onClick={() => {
                              setCourseCode(c.code);
                              setShowCourseSuggestions(false);
                            }}
                            className="w-full px-3 py-2 text-left text-xs hover:bg-slate-700 text-slate-200 flex items-center justify-between"
                          >
                            <span className="font-mono font-bold text-purple-300">{c.code}</span>
                            <span className="text-slate-400 truncate ml-2 text-[11px]">{c.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Faculty Initial */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Faculty Initial (e.g. JUDDIN, TD)
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={facultyInitial}
                        onChange={(e) => setFacultyInitial(e.target.value.toUpperCase())}
                        placeholder="JUDDIN"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono font-bold uppercase focus:outline-none focus:border-purple-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Drag & Drop File Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  2. Select or Drop Multiple Files
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-purple-500 bg-purple-950/20 scale-[1.01]'
                      : 'border-slate-700 hover:border-purple-500/60 bg-slate-800/40 hover:bg-slate-800/60'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-2 text-purple-400">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-200">
                    Drop multiple materials here, or <span className="text-purple-400 underline">browse files</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Supported: PDF, PPTX, DOCX, ZIP, JPG, PNG (Max 250MB each)
                  </p>
                </div>
              </div>

              {/* Section 3: Selected Files Configuration Table */}
              {uploadItems.length > 0 && (
                <div className="space-y-3">
                  {/* Bulk Defaults Bar */}
                  <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <span className="font-bold text-purple-200 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-purple-400" />
                      <span>{uploadItems.length} Files Selected</span>
                    </span>

                    <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                      <select
                        value={defaultSemester}
                        onChange={(e) => setDefaultSemester(e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-purple-500/30 text-xs font-medium text-slate-200"
                      >
                        {semesterOptions.map((s) => (
                          <option key={s.code} value={s.code}>
                            {s.title}
                          </option>
                        ))}
                      </select>

                      <select
                        value={defaultFileType}
                        onChange={(e) => setDefaultFileType(e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-purple-500/30 text-xs font-medium text-slate-200"
                      >
                        {FILE_TYPES.map((cat: string) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={applyDefaultsToAll}
                        className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/30 font-bold transition-all"
                      >
                        Apply to All
                      </button>
                    </div>
                  </div>

                  {/* Individual File Rows */}
                  <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                    {uploadItems.map((item, idx) => {
                      
                      return (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                        >
                          {/* File info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                              <span className="font-bold text-slate-200 truncate" title={item.file.name}>
                                {item.file.name}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono ml-6">
                              {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                            </span>
                          </div>

                          {/* Individual Semester & FileType Controls */}
                          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-between sm:justify-end">
                            {/* Semester Picker for THIS file */}
                            <select
                              value={item.semester}
                              disabled={isUploading}
                              onChange={(e) => updateItemSemester(idx, e.target.value)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 font-medium focus:outline-none focus:border-purple-500"
                            >
                              {semesterOptions.map((s) => (
                                <option key={s.code} value={s.code}>
                                  {s.title}
                                </option>
                              ))}
                            </select>

                            {/* Doc Type Picker for THIS file */}
                            <select
                              value={item.fileType}
                              disabled={isUploading}
                              onChange={(e) => updateItemFileType(idx, e.target.value)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 font-medium focus:outline-none focus:border-purple-500"
                            >
                              {FILE_TYPES.map((cat: string) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>

                            {/* Remove or Status button */}
                            {item.status === 'uploading' ? (
                              <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                            ) : item.status === 'saving' ? (
                              <span className="text-[10px] text-amber-400 font-bold">Saving</span>
                            ) : item.status === 'done' ? (
                              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                                <Check className="w-3.5 h-3.5" />
                                <span>{item.isDuplicate ? 'Linked' : 'Uploaded'}</span>
                              </div>
                            ) : item.status === 'failed' ? (
                              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-bold" title={item.error}>
                                <span>Failed</span>
                                <button
                                  type="button"
                                  disabled={isUploading}
                                  onClick={() => removeFile(idx)}
                                  className="p-0.5 hover:text-white"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                disabled={isUploading}
                                onClick={() => removeFile(idx)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 transition-colors"
                                title="Remove file"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Progress & Submit Button */}
              <div>
                {isUploading && (
                  <div className="mb-3 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                      <span>Uploading files to Vault...</span>
                      <span className="text-purple-400 font-mono">{overallProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-300"
                        style={{ width: `${overallProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isUploading || uploadItems.length === 0}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm shadow-lg shadow-purple-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Processing Bulk Upload ({overallProgress}%)...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>
                        Upload {uploadItems.length > 0 ? `${uploadItems.length} Materials` : 'Materials'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
