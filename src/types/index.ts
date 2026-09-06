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
  created_at: string;
  status: 'approved' | 'pending' | 'rejected';
  views_count?: number;
  downloads_count?: number;
}

export interface Contributor {
  uploader_id: string;
  name: string;
  student_id: string;
  department?: string;
  program?: string;
  upload_count: number;
  avatar_url?: string;
  badge: 'Pioneer' | 'Master Contributor' | 'Scholar' | 'Rising Star';
}

export interface FilterState {
  course: string;
  semester: string;
  faculty: string;
  category: string;
  searchQuery: string;
}

export const KNOWN_FILE_TYPES = [
  'Slide',
  'Lab Manual',
  'Book',
  'Course Outline',
  'Lab Report',
  'Quiz Questions',
  'Sample Code',
  'Assignment Solution',
  'Project Report',
  'Lecture Notes',
  'Mid Questions',
  'Final Question',
  'Final Questions',
  'Other'
];

export const CATEGORY_META: Record<string, { label: string; color: string; icon: string }> = {
  'Slide': { label: 'Lecture Slides', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30', icon: 'Presentation' },
  'Lab Manual': { label: 'Lab Manual', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30', icon: 'Terminal' },
  'Book': { label: 'Reference Book', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30', icon: 'Bookmark' },
  'Course Outline': { label: 'Course Outline', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: 'Compass' },
  'Lab Report': { label: 'Lab Report', color: 'bg-teal-500/10 text-teal-400 border-teal-500/30', icon: 'FileText' },
  'Quiz Questions': { label: 'Quiz Questions', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30', icon: 'HelpCircle' },
  'Sample Code': { label: 'Sample Code', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: 'Code' },
  'Assignment Solution': { label: 'Assignment Solution', color: 'bg-lime-500/10 text-lime-400 border-lime-500/30', icon: 'CheckSquare' },
  'Project Report': { label: 'Project Report', color: 'bg-violet-500/10 text-violet-400 border-violet-500/30', icon: 'Folder' },
  'Lecture Notes': { label: 'Lecture Notes', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: 'BookOpen' },
  'Mid Questions': { label: 'Mid Exam Questions', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: 'FileQuestion' },
  'Final Question': { label: 'Final Exam Question', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30', icon: 'FileCheck2' },
  'Final Questions': { label: 'Final Exam Questions', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30', icon: 'FileCheck2' },
  'Other': { label: 'Other Documents', color: 'bg-slate-500/10 text-slate-400 border-slate-500/30', icon: 'File' },
};

export const getCategoryMeta = (fileType: string) => {
  return CATEGORY_META[fileType] || {
    label: fileType || 'Document',
    color: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    icon: 'FileText'
  };
};
