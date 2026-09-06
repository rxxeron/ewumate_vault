export type MaterialType =
  | 'mid_question'
  | 'final_question'
  | 'quiz_question'
  | 'slide'
  | 'notes'
  | 'lab_manual'
  | 'book'
  | 'outline'
  | 'other';

export interface StudyMaterial {
  id: string;
  uploader_id?: string;
  uploader_name?: string;
  uploader_student_id?: string;
  faculty_initial: string;
  course_code: string;
  course_title?: string;
  semester: string;
  file_type: MaterialType;
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
  upload_count: number;
  avatar_url?: string;
  badge: 'Pioneer' | 'Master Contributor' | 'Scholar' | 'Rising Star';
}

export interface FilterState {
  course: string;
  semester: string;
  faculty: string;
  category: MaterialType | 'all';
  searchQuery: string;
}

export const CATEGORY_LABELS: Record<MaterialType, { label: string; color: string; icon: string }> = {
  mid_question: { label: 'Mid Exam Question', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: 'FileQuestion' },
  final_question: { label: 'Final Exam Question', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30', icon: 'FileCheck2' },
  quiz_question: { label: 'Quiz / Class Test', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30', icon: 'HelpCircle' },
  slide: { label: 'Lecture Slides', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30', icon: 'Presentation' },
  notes: { label: 'Class Notes', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: 'BookOpen' },
  lab_manual: { label: 'Lab Manual / Code', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30', icon: 'Terminal' },
  book: { label: 'Reference Book', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30', icon: 'Bookmark' },
  outline: { label: 'Course Outline', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: 'Compass' },
  other: { label: 'Other Document', color: 'bg-slate-500/10 text-slate-400 border-slate-500/30', icon: 'FileText' },
};
