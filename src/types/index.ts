export type MaterialType = string;

export interface StudyMaterial {
  id: string;
  uploader_id?: string;
  uploader_name?: string;
  uploader_student_id?: string;
  uploader_department?: string;
  uploader_program?: string;
  faculty_initial: string;
  course_code: string;
  course_title?: string;
  semester: string;
  file_type: string;
  drive_account_id?: string;
  drive_file_id: string;
  file_name: string;
  file_size_bytes?: number;
  file_hash?: string;
  created_at: string;
  status: 'approved' | 'pending' | 'rejected';
  views_count?: number;
  downloads_count?: number;
  helpful_count?: number;
  reports_count?: number;
}

export interface Contributor {
  uploader_id: string;
  name: string;
  student_id?: string;
  department?: string;
  program?: string;
  upload_count: number;
  avatar_url?: string;
  photo_url?: string;
  rank?: number | null;
  badge: 'Pioneer' | 'Master Contributor' | 'Scholar' | 'Rising Star';
}

export interface FilterState {
  course: string;
  semester: string;
  faculty: string;
  category: string;
  searchQuery: string;
}

// Exact list specified by the user:
export const FILE_TYPES = [
  'Term Paper',
  'Mid Question',
  'Final Question',
  'Quiz Questions',
  'Course Outline',
  'Slide',
  'Sample Code',
  'Book',
  'Lab Manual',
  'Lab Report',
  'Project',
  'Project Report',
  'Lecture Notes',
  'Assignment',
  'Assignment Solution',
  'Syllabus',
  'Cheat Sheet',
  'Class Handout',
  'Other'
];

export const CATEGORY_COLOR_MAP: Record<string, string> = {
  'Term Paper': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  'Mid Question': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'Final Question': 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  'Quiz Questions': 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  'Course Outline': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'Slide': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  'Sample Code': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  'Book': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  'Lab Manual': 'bg-teal-500/10 text-teal-400 border-teal-500/30',
  'Lab Report': 'bg-teal-500/10 text-teal-400 border-teal-500/30',
  'Project': 'bg-violet-500/10 text-violet-400 border-violet-500/30',
  'Project Report': 'bg-violet-500/10 text-violet-400 border-violet-500/30',
  'Lecture Notes': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  'Assignment': 'bg-lime-500/10 text-lime-400 border-lime-500/30',
  'Assignment Solution': 'bg-lime-500/10 text-lime-400 border-lime-500/30',
  'Syllabus': 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  'Cheat Sheet': 'bg-pink-500/10 text-pink-400 border-pink-500/30',
  'Class Handout': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  'Other': 'bg-slate-500/10 text-slate-400 border-slate-500/30',
};

// Normalize database plurals and cases to clean standard categories
export const normalizeFileType = (typeStr: string): string => {
  if (!typeStr) return 'Other';
  const trimmed = typeStr.trim();
  const lower = trimmed.toLowerCase();
  if (lower === 'mid questions' || lower === 'mid question') return 'Mid Question';
  if (lower === 'final questions' || lower === 'final question') return 'Final Question';
  if (lower === 'quiz question' || lower === 'quiz questions') return 'Quiz Questions';
  if (lower === 'slides' || lower === 'slide') return 'Slide';
  if (lower === 'lab reports' || lower === 'lab report') return 'Lab Report';
  if (lower === 'lab manuals' || lower === 'lab manual') return 'Lab Manual';
  if (lower === 'project reports' || lower === 'project report') return 'Project Report';
  if (lower === 'lecture notes' || lower === 'lecture note') return 'Lecture Notes';
  if (lower === 'assignments' || lower === 'assignment') return 'Assignment';
  if (lower === 'assignment solutions' || lower === 'assignment solution') return 'Assignment Solution';
  return trimmed;
};

export const getCategoryMeta = (fileType: string) => {
  const norm = normalizeFileType(fileType);
  const color = CATEGORY_COLOR_MAP[norm] || 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  return {
    label: norm,
    color: color
  };
};

// Validate institutional student email or administrative accounts
export const validateAllowedEmail = (emailStr?: string | null): boolean => {
  if (!emailStr) return false;
  const trimmed = emailStr.trim().toLowerCase();

  // 1. Institutional EWU student emails (e.g. 2022-1-60-123@std.ewubd.edu)
  if (
    /^[0-9]{4}-[1-3]-[0-9]{2}-[0-9]{3}@std\.ewubd\.edu$/.test(trimmed) ||
    trimmed.endsWith('@std.ewubd.edu') ||
    trimmed.endsWith('@ewubd.edu')
  ) {
    return true;
  }

  // 2. Authorized system admins
  const adminEmails = [
    'rhrakibulhasan279@gmail.com',
    'rakibulhasan@ewubd.edu',
    'rxxeron@gmail.com'
  ];
  return adminEmails.includes(trimmed);
};

export const extractStudentId = (emailStr?: string | null): string => {
  if (!emailStr) return '';
  return emailStr.split('@')[0];
};
