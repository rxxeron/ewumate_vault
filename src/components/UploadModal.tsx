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
  Smartphone
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { KNOWN_FILE_TYPES, getCategoryMeta } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onRequireAuth: () => void;
  onOpenAppModal: () => void;
  onUploadSuccess: () => void;
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

  const [files, setFiles] = useState<File[]>([]);
  const [fileType, setFileType] = useState<string>('Mid Questions');
  const [courseCode, setCourseCode] = useState('');
  const [facultyInitial, setFacultyInitial] = useState('');
  const [semester, setSemester] = useState('summer2026');

  const [semesterOptions, setSemesterOptions] = useState<{ code: string; title: string }[]>([]);
  const [courseSuggestions, setCourseSuggestions] = useState<{ code: string; name: string }[]>([]);
  const [showCourseSuggestions, setShowCourseSuggestions] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  useEffect(() => {
    fetchSemesters();
  }, []);

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
        setSemester(data[0].code);
      } else {
        setSemesterOptions([
          { code: 'summer2026', title: 'Summer 2026' },
          { code: 'spring2026', title: 'Spring 2026' },
          { code: 'fall2025', title: 'Fall 2025' }
        ]);
      }
    } catch (e) {
      setSemesterOptions([
        { code: 'summer2026', title: 'Summer 2026' },
        { code: 'spring2026', title: 'Spring 2026' },
        { code: 'fall2025', title: 'Fall 2025' }
      ]);
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

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const selected = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...selected]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selected]);
    }
  };

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (files.length === 0) {
      setErrorMessage('Please select at least one file to upload.');
      return;
    }
    if (!courseCode.trim()) {
      setErrorMessage('Please provide a course code (e.g. CSE106).');
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);

    try {
      const cleanCourse = courseCode.trim().replace(/\s+/g, '').toUpperCase();
      const cleanFaculty = facultyInitial.trim().replace(/[^a-zA-Z]/g, '').toUpperCase();
      let completed = 0;

      for (const file of files) {
        let driveFileId = 'fallback-local-' + Date.now();
        let driveAccountId = 'primary';

        try {
          const { data: edgeData, error: edgeError } = await supabase.functions.invoke('get-drive-upload-url', {
            body: {
              fileName: file.name,
              fileSizeBytes: file.size,
              mimeType: file.type || 'application/octet-stream'
            }
          });

          if (!edgeError && edgeData?.uploadUrl) {
            const driveRes = await fetch(edgeData.uploadUrl, {
              method: 'PUT',
              body: file
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
        } catch (edgeErr) {
          console.warn('Direct drive edge invocation notice:', edgeErr);
        }

        const { error: dbError } = await supabase
          .from('study_materials')
          .insert({
            uploader_id: user.id,
            faculty_initial: cleanFaculty || 'GENERAL',
            course_code: cleanCourse,
            semester: semester,
            file_type: fileType,
            drive_account_id: driveAccountId,
            drive_file_id: driveFileId,
            file_name: file.name,
            file_size_bytes: file.size,
            status: 'approved'
          });

        if (dbError) throw dbError;
        completed++;
        setUploadProgress(Math.round((completed / files.length) * 90));
      }

      setUploadProgress(100);
      setSuccessCount(completed);
      onUploadSuccess();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {successCount !== null ? (
          <div className="text-center py-6 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-white mb-2">
              Upload Successful!
            </h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto mb-6">
              Thank you for contributing {successCount} {successCount === 1 ? 'material' : 'materials'} to the EWUmate Vault!
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
                setFiles([]);
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
            >
              Done & Return to Vault
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  Contribute Study Materials
                </h3>
                <p className="text-xs text-slate-400">
                  Uploading as <span className="text-purple-400 font-semibold">{user.email}</span>
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Select Files (PDFs, Slides, Images, Notes)
                </label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-purple-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-800/40 hover:bg-slate-800/60 transition-all"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-2 text-slate-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-200">
                    Click to browse or drop files here
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Supported: PDF, PPTX, DOCX, PNG, JPG, ZIP (Max 250MB)
                  </p>
                </div>

                {files.length > 0 && (
                  <div className="mt-3 space-y-1.5 max-h-28 overflow-y-auto custom-scrollbar">
                    {files.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-200 border border-slate-700/60"
                      >
                        <span className="truncate max-w-[280px]">{f.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">
                            {(f.size / (1024 * 1024)).toFixed(1)} MB
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            className="text-slate-400 hover:text-rose-400"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Course Code */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Course Code (e.g. CSE106, MAT101)
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white font-mono font-bold uppercase focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>

                {showCourseSuggestions && courseSuggestions.length > 0 && (
                  <div className="absolute z-20 top-full mt-1 w-full rounded-xl bg-slate-800 border border-slate-700 shadow-xl overflow-hidden">
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

              {/* Faculty Initial & Semester */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Faculty Initial (e.g. JUDDIN)
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={facultyInitial}
                      onChange={(e) => setFacultyInitial(e.target.value.toUpperCase())}
                      placeholder="JUDDIN"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white font-mono font-bold uppercase focus:outline-none focus:border-purple-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500 transition-all"
                  >
                    {semesterOptions.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Material Type Category */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Material Category
                </label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500 transition-all"
                >
                  {KNOWN_FILE_TYPES.map((cat) => (
                    <option key={cat} value={cat}>
                      {getCategoryMeta(cat).label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm shadow-lg shadow-purple-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
              >
                {isUploading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Uploading ({uploadProgress}%)...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Submit {files.length > 0 ? `(${files.length} Files)` : ''}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
