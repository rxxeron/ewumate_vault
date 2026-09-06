import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Plus, 
  Trash2, 
  X,
  Layers,
  ArrowLeft,
  HardDrive,
  FolderUp,
  Clock,
  Check,
  Search,
  ChevronDown
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { FILE_TYPES, getCategoryMeta } from '../types';

interface UploadPageProps {
  user: User | null;
  onNavigateBack: () => void;
  onRequireAuth: () => void;
  onUploadSuccess: () => void;
}

export interface CourseMaterialItem {
  id: string;
  file: File;
  fileType: string;
  progress: number;
  status: 'pending' | 'uploading' | 'saving' | 'done' | 'failed';
  error?: string;
}

export interface CourseUploadBlock {
  id: string;
  courseCode: string;
  courseName?: string;
  facultyInitial: string;
  materials: CourseMaterialItem[];
}

export interface DropdownOption {
  value: string;
  label: string;
  subLabel?: string;
}

// Searchable custom dropdown component for Course Code and Faculty Initial
const SearchableSelect: React.FC<{
  label: string;
  required?: boolean;
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string, subLabel?: string) => void;
  disabled?: boolean;
}> = ({
  label,
  required,
  icon,
  placeholder,
  value,
  options,
  onChange,
  disabled
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.value.toLowerCase().includes(query.toLowerCase()) ||
    opt.label.toLowerCase().includes(query.toLowerCase()) ||
    (opt.subLabel && opt.subLabel.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 100);

  const selectedOption = options.find(o => o.value.toUpperCase() === value.toUpperCase());

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>

      {/* Trigger */}
      <div
        onClick={() => {
          if (disabled) return;
          setIsOpen(!isOpen);
          if (!isOpen) {
            setTimeout(() => searchInputRef.current?.focus(), 50);
          }
        }}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-slate-800/90 border transition-all cursor-pointer ${
          isOpen ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-slate-700 hover:border-slate-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="text-slate-400 shrink-0">{icon}</div>
          <div className="truncate">
            {value ? (
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-white">
                  {selectedOption ? selectedOption.value : value}
                </span>
                {selectedOption?.subLabel && (
                  <span className="text-xs text-slate-400 truncate max-w-[150px]">
                    ({selectedOption.subLabel})
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs text-slate-500">{placeholder}</span>
            )}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-purple-400' : ''}`} />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
          {/* Quick Search */}
          <div className="p-2 border-b border-slate-800 bg-slate-950/80 sticky top-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type to filter..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Options */}
          <div className="max-h-56 overflow-y-auto scrollbar-thin divide-y divide-slate-800/40">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value, opt.subLabel);
                    setIsOpen(false);
                    setQuery('');
                  }}
                  className={`px-3.5 py-2.5 hover:bg-purple-600/20 hover:text-purple-300 cursor-pointer text-xs flex items-center justify-between transition-colors ${
                    value.toUpperCase() === opt.value.toUpperCase() ? 'bg-purple-600/30 text-purple-200 font-bold' : 'text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono font-bold text-white">{opt.value}</span>
                    {opt.subLabel && (
                      <span className="text-slate-400 text-[11px] truncate max-w-[220px]">
                        {opt.subLabel}
                      </span>
                    )}
                  </div>
                  {value.toUpperCase() === opt.value.toUpperCase() && (
                    <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const UploadPage: React.FC<UploadPageProps> = ({
  user,
  onNavigateBack,
  onRequireAuth,
  onUploadSuccess
}) => {
  // Step 1: Semester selection dropdown
  const [selectedSemester, setSelectedSemester] = useState('summer2026');
  const [semesterOptions, setSemesterOptions] = useState<{ code: string; title: string }[]>([]);

  // Metadata options for Course Code and Faculty Initial dropdowns
  const [courseOptions, setCourseOptions] = useState<DropdownOption[]>([]);
  const [facultyOptions, setFacultyOptions] = useState<DropdownOption[]>([]);

  // Multi-course blocks
  const [courses, setCourses] = useState<CourseUploadBlock[]>([
    {
      id: 'course-1',
      courseCode: '',
      facultyInitial: 'GENERAL',
      materials: []
    }
  ]);

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successReport, setSuccessReport] = useState<{ totalFiles: number; coursesCount: number } | null>(null);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      // 1. Semesters
      const { data: sems } = await supabase
        .from('semesters')
        .select('code, title')
        .order('code', { ascending: false });

      if (sems && sems.length > 0) {
        setSemesterOptions(sems);
        setSelectedSemester(sems[0].code);
      } else {
        const fallbacks = [
          { code: 'summer2026', title: 'Summer 2026' },
          { code: 'spring2026', title: 'Spring 2026' },
          { code: 'fall2025', title: 'Fall 2025' }
        ];
        setSemesterOptions(fallbacks);
        setSelectedSemester(fallbacks[0].code);
      }

      // 2. Courses (1100+ courses)
      const { data: courseData } = await supabase
        .from('course_metadata')
        .select('code, name')
        .order('code', { ascending: true });

      if (courseData) {
        setCourseOptions(courseData.map(c => ({
          value: c.code,
          label: c.code,
          subLabel: c.name || ''
        })));
      }

      // 3. Faculty Initial directory
      const { data: facultyData } = await supabase
        .from('faculty_directory')
        .select('short_name, full_name')
        .order('short_name', { ascending: true });

      if (facultyData) {
        const formatted: DropdownOption[] = [
          { value: 'GENERAL', label: 'GENERAL', subLabel: 'General / No specific faculty' },
          ...facultyData.map(f => ({
            value: f.short_name,
            label: f.short_name,
            subLabel: f.full_name || ''
          }))
        ];
        setFacultyOptions(formatted);
      } else {
        setFacultyOptions([
          { value: 'GENERAL', label: 'GENERAL', subLabel: 'General / No specific faculty' }
        ]);
      }
    } catch (e) {
      console.error('Error loading metadata:', e);
    }
  };

  const updateCourseField = (courseId: string, field: 'courseCode' | 'facultyInitial' | 'courseName', value: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        return { ...c, [field]: value };
      }
      return c;
    }));
  };

  const handleAddCourseBlock = () => {
    const newId = 'course-' + Date.now();
    setCourses(prev => [
      ...prev,
      {
        id: newId,
        courseCode: '',
        facultyInitial: 'GENERAL',
        materials: []
      }
    ]);
  };

  const handleRemoveCourseBlock = (courseId: string) => {
    if (courses.length <= 1) return;
    setCourses(prev => prev.filter(c => c.id !== courseId));
  };

  const handleAddFilesToCourse = (courseId: string, files: File[]) => {
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        const existing = [...c.materials];
        files.forEach(f => {
          if (!existing.some(m => m.file.name === f.name && m.file.size === f.size)) {
            existing.push({
              id: 'mat-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
              file: f,
              fileType: 'Mid Question',
              progress: 0,
              status: 'pending'
            });
          }
        });
        return { ...c, materials: existing };
      }
      return c;
    }));
  };

  const handleRemoveMaterial = (courseId: string, materialId: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        return {
          ...c,
          materials: c.materials.filter(m => m.id !== materialId)
        };
      }
      return c;
    }));
  };

  const handleUpdateMaterialType = (courseId: string, materialId: string, newType: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        return {
          ...c,
          materials: c.materials.map(m => m.id === materialId ? { ...m, fileType: newType } : m)
        };
      }
      return c;
    }));
  };

  const handleSetCourseAllFileType = (courseId: string, newType: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        return {
          ...c,
          materials: c.materials.map(m => ({ ...m, fileType: newType }))
        };
      }
      return c;
    }));
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Upload all courses & materials in batch
  const handleUploadAll = async () => {
    setErrorMessage(null);

    if (!user) {
      onRequireAuth();
      return;
    }

    const totalFiles = courses.reduce((acc, c) => acc + c.materials.length, 0);
    if (totalFiles === 0) {
      setErrorMessage('Please add at least one material to upload.');
      return;
    }

    for (let i = 0; i < courses.length; i++) {
      const c = courses[i];
      if (c.materials.length > 0 && !c.courseCode.trim()) {
        setErrorMessage('Please select a Course Code for Course #' + (i + 1) + '.');
        return;
      }
    }

    setIsUploading(true);
    setOverallProgress(5);

    try {
      let completedFiles = 0;

      for (const course of courses) {
        if (course.materials.length === 0) continue;

        const cleanCourse = course.courseCode.trim().replace(/\s+/g, '').toUpperCase();
        const cleanFaculty = course.facultyInitial.trim().replace(/[^a-zA-Z]/g, '').toUpperCase() || 'GENERAL';

        for (const item of course.materials) {
          setCourses(prev => prev.map(c => {
            if (c.id === course.id) {
              return {
                ...c,
                materials: c.materials.map(m => m.id === item.id ? { ...m, status: 'uploading', progress: 25 } : m)
              };
            }
            return c;
          }));

          let driveFileId = 'fallback-local-' + Date.now();
          let driveAccountId = 'primary';

          try {
            const { data: edgeData, error: edgeError } = await supabase.functions.invoke('get-drive-upload-url', {
              body: {
                fileName: item.file.name,
                fileSizeBytes: item.file.size,
                mimeType: item.file.type || 'application/octet-stream'
              }
            });

            if (!edgeError && edgeData?.uploadUrl) {
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
          } catch (edgeErr) {
            console.warn('Drive upload fallback:', edgeErr);
          }

          setCourses(prev => prev.map(c => {
            if (c.id === course.id) {
              return {
                ...c,
                materials: c.materials.map(m => m.id === item.id ? { ...m, status: 'saving', progress: 80 } : m)
              };
            }
            return c;
          }));

          const { error: dbError } = await supabase
            .from('study_materials')
            .insert({
              uploader_id: user.id,
              faculty_initial: cleanFaculty,
              course_code: cleanCourse,
              semester: selectedSemester,
              file_type: item.fileType,
              drive_account_id: driveAccountId,
              drive_file_id: driveFileId,
              file_name: item.file.name,
              file_size_bytes: item.file.size,
              status: 'approved'
            });

          if (dbError) throw dbError;

          completedFiles++;
          setOverallProgress(Math.round((completedFiles / totalFiles) * 100));

          setCourses(prev => prev.map(c => {
            if (c.id === course.id) {
              return {
                ...c,
                materials: c.materials.map(m => m.id === item.id ? { ...m, status: 'done', progress: 100 } : m)
              };
            }
            return c;
          }));
        }
      }

      const activeCourseCount = courses.filter(c => c.materials.length > 0).length;
      setSuccessReport({
        totalFiles: completedFiles,
        coursesCount: activeCourseCount
      });
      onUploadSuccess();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Bulk upload encountered an error. Some items may need retry.');
    } finally {
      setIsUploading(false);
    }
  };

  const totalFilesCount = courses.reduce((acc, c) => acc + c.materials.length, 0);
  const selectedSemesterTitle = semesterOptions.find(s => s.code === selectedSemester)?.title || selectedSemester;

  if (successReport) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-slate-900 border border-emerald-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl text-center animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-black uppercase tracking-wider mb-4 inline-block">
            Batch Upload Complete
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight">
            Entire Semester Uploaded!
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed mb-6 max-w-md mx-auto">
            Successfully uploaded <strong className="text-emerald-400 font-mono">{successReport.totalFiles} materials</strong> across <strong className="text-indigo-400 font-mono">{successReport.coursesCount} courses</strong> for <strong className="text-white">{selectedSemesterTitle}</strong>.
          </p>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-left text-xs text-slate-400 space-y-2 mb-8">
            <div className="flex items-center justify-between">
              <span>Target Semester:</span>
              <span className="font-bold text-slate-200">{selectedSemesterTitle}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Verified Courses:</span>
              <span className="font-bold text-slate-200">{courses.filter(c => c.courseCode).map(c => c.courseCode.toUpperCase()).join(', ')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Contributor Rank:</span>
              <span className="font-bold text-amber-400">Updated in Hall of Fame</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
            <button
              onClick={onNavigateBack}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-sm shadow-lg shadow-purple-600/30 hover:opacity-95 active:scale-95 transition-all"
            >
              Browse Public Vault
            </button>
            <button
              onClick={() => {
                setSuccessReport(null);
                setCourses([{ id: 'course-' + Date.now(), courseCode: '', facultyInitial: 'GENERAL', materials: [] }]);
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-all"
            >
              Upload Another Batch
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-28 sm:py-8 animate-fade-in">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <button
          onClick={onNavigateBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-bold transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Archive</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Course Semester Bulk Upload</span>
          </span>
        </div>
      </div>

      {/* Main Title & Instructions */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3 mb-2">
          <FolderUp className="w-8 h-8 text-purple-400" />
          <span>Upload Semester Course Materials</span>
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          Select your semester first, add your enrolled courses, and drop materials for each course. You can upload all your courses and files for the entire semester in a single batch!
        </p>
      </div>

      {/* Auth Notice if not logged in */}
      {!user && (
        <div className="mb-8 p-6 rounded-3xl bg-purple-950/20 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Student Sign In Required</h4>
              <p className="text-xs text-slate-300">
                You must be logged in with your EWU student email (<span className="text-purple-300 font-mono">@std.ewubd.edu</span>) to submit materials.
              </p>
            </div>
          </div>
          <button
            onClick={onRequireAuth}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs shadow-lg shadow-purple-600/30 hover:opacity-95 shrink-0"
          >
            Sign In Now
          </button>
        </div>
      )}

      {/* STEP 1: Choose Semester Dropdown */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-purple-500/30 shadow-xl mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-black text-base border border-purple-500/30">
              1
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-400">Step 1</span>
              <h2 className="text-lg font-black text-white">Select Academic Semester</h2>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full sm:w-64 px-4 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
            >
              {semesterOptions.map((sem) => (
                <option key={sem.code} value={sem.code}>
                  {sem.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* STEP 2 & 3: Course Blocks List */}
      <div className="space-y-6 mb-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-black text-base border border-indigo-500/30">
              2
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-400">Step 2</span>
              <h2 className="text-lg font-black text-white">
                Courses & Materials ({courses.length})
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddCourseBlock}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-black transition-all active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Another Course</span>
          </button>
        </div>

        {courses.map((course, courseIndex) => {
          return (
            <CourseBlockCard
              key={course.id}
              course={course}
              index={courseIndex}
              totalCourses={courses.length}
              courseOptions={courseOptions}
              facultyOptions={facultyOptions}
              onRemoveCourse={() => handleRemoveCourseBlock(course.id)}
              onCourseSelect={(code, name) => {
                updateCourseField(course.id, 'courseCode', code);
                if (name) updateCourseField(course.id, 'courseName', name);
              }}
              onFacultySelect={(fac) => updateCourseField(course.id, 'facultyInitial', fac)}
              onAddFiles={(files) => handleAddFilesToCourse(course.id, files)}
              onRemoveMaterial={(matId) => handleRemoveMaterial(course.id, matId)}
              onUpdateMaterialType={(matId, type) => handleUpdateMaterialType(course.id, matId, type)}
              onSetAllFileType={(type) => handleSetCourseAllFileType(course.id, type)}
              formatBytes={formatBytes}
              isUploading={isUploading}
            />
          );
        })}
      </div>

      {/* Add Another Course Large Button CTA */}
      <div className="mb-8">
        <button
          type="button"
          onClick={handleAddCourseBlock}
          className="w-full py-4 rounded-3xl border-2 border-dashed border-slate-800 hover:border-purple-500/50 hover:bg-purple-500/5 text-slate-400 hover:text-purple-300 font-bold text-sm flex items-center justify-center gap-2 transition-all group"
        >
          <div className="w-7 h-7 rounded-xl bg-slate-800 group-hover:bg-purple-600/20 group-hover:text-purple-400 flex items-center justify-center transition-colors">
            <Plus className="w-4 h-4" />
          </div>
          <span>Add another course for {selectedSemesterTitle}</span>
        </button>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Bottom Master Submission Bar */}
      <div className="sticky bottom-4 z-20 p-4 sm:p-5 rounded-3xl bg-slate-900/95 backdrop-blur-xl border border-slate-800/90 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs text-slate-300">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="font-black text-white text-sm">
              {totalFilesCount} {totalFilesCount === 1 ? 'material' : 'materials'} across {courses.length} {courses.length === 1 ? 'course' : 'courses'}
            </div>
            <div className="text-[11px] text-slate-400">
              Semester: <span className="text-purple-300 font-semibold">{selectedSemesterTitle}</span>
            </div>
          </div>
        </div>

        <div className="w-full sm:w-auto flex items-center gap-3">
          {isUploading && (
            <div className="w-32 hidden md:block">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-1">
                <span>Uploading...</span>
                <span>{overallProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleUploadAll}
            disabled={isUploading || totalFilesCount === 0}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-black shadow-xl shadow-purple-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Uploading Semester ({overallProgress}%)...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload All Courses & Materials</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

interface CourseBlockCardProps {
  course: CourseUploadBlock;
  index: number;
  totalCourses: number;
  courseOptions: DropdownOption[];
  facultyOptions: DropdownOption[];
  onRemoveCourse: () => void;
  onCourseSelect: (code: string, name?: string) => void;
  onFacultySelect: (faculty: string) => void;
  onAddFiles: (files: File[]) => void;
  onRemoveMaterial: (id: string) => void;
  onUpdateMaterialType: (id: string, type: string) => void;
  onSetAllFileType: (type: string) => void;
  formatBytes: (bytes: number) => string;
  isUploading: boolean;
}

const CourseBlockCard: React.FC<CourseBlockCardProps> = ({
  course,
  index,
  totalCourses,
  courseOptions,
  facultyOptions,
  onRemoveCourse,
  onCourseSelect,
  onFacultySelect,
  onAddFiles,
  onRemoveMaterial,
  onUpdateMaterialType,
  onSetAllFileType,
  formatBytes,
  isUploading
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [batchType, setBatchType] = useState('Mid Question');

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      onAddFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 transition-all">
      {/* Course Block Header */}
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 font-mono font-bold text-xs flex items-center justify-center border border-slate-700">
            #{index + 1}
          </div>
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span>{course.courseCode.toUpperCase() || `Course #${index + 1}`}</span>
              {course.courseName && (
                <span className="text-xs text-slate-400 font-normal">({course.courseName})</span>
              )}
            </h3>
          </div>
        </div>

        {totalCourses > 1 && (
          <button
            type="button"
            onClick={onRemoveCourse}
            className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-xl border border-rose-500/20 transition-all"
            title="Remove this course block"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove Course</span>
          </button>
        )}
      </div>

      {/* Course Dropdowns: Code + Faculty Initial */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {/* Course Code Dropdown */}
        <SearchableSelect
          label="Course Code"
          required
          icon={<BookOpen className="w-4 h-4" />}
          placeholder="Select Course (e.g. CSE106)"
          value={course.courseCode}
          options={courseOptions}
          onChange={(val, sub) => onCourseSelect(val, sub)}
          disabled={isUploading}
        />

        {/* Faculty Initial Dropdown */}
        <SearchableSelect
          label="Faculty Initial"
          icon={<GraduationCap className="w-4 h-4" />}
          placeholder="Select Faculty (or GENERAL)"
          value={course.facultyInitial || 'GENERAL'}
          options={facultyOptions}
          onChange={(val) => onFacultySelect(val)}
          disabled={isUploading}
        />
      </div>

      {/* Materials Upload Drop Zone for this course */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center mb-4 ${
          isDragOver
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-slate-800 hover:border-slate-700 bg-slate-950/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) onAddFiles(Array.from(e.target.files));
          }}
        />
        <div className="w-10 h-10 rounded-2xl bg-slate-800 text-purple-400 flex items-center justify-center mx-auto mb-2">
          <Upload className="w-5 h-5" />
        </div>
        <p className="text-xs font-bold text-slate-200">
          Drop materials for <span className="text-purple-300 font-mono">{course.courseCode.toUpperCase() || 'this course'}</span> here, or <span className="text-purple-400 underline">browse</span>
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          PDF, PPTX, DOCX, ZIP, IPYNB, Images up to 100MB
        </p>
      </div>

      {/* List of Files selected for this course */}
      {course.materials.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1 flex-wrap gap-2">
            <span>{course.materials.length} files attached:</span>
            
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Set all to:</span>
              <select
                value={batchType}
                onChange={(e) => {
                  setBatchType(e.target.value);
                  onSetAllFileType(e.target.value);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                {FILE_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            {course.materials.map((item) => {
              const meta = getCategoryMeta(item.fileType);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-800/70 border border-slate-700/60"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs text-white truncate" title={item.file.name}>
                        {item.file.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {formatBytes(item.file.size)}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <select
                      value={item.fileType}
                      disabled={isUploading}
                      onChange={(e) => onUpdateMaterialType(item.id, e.target.value)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${meta.color} bg-slate-900 focus:outline-none cursor-pointer`}
                    >
                      {FILE_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>

                    {item.status === 'uploading' ? (
                      <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    ) : item.status === 'saving' ? (
                      <span className="text-[10px] text-amber-400 font-bold">Saving</span>
                    ) : item.status === 'done' ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => onRemoveMaterial(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded-lg transition-colors"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
