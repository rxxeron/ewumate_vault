import React from 'react';
import { 
  Filter, 
  Layers, 
  Calendar, 
  GraduationCap, 
  RotateCcw,
  BookOpen,
  FileQuestion,
  Sparkles,
  Check
} from 'lucide-react';
import type { MaterialType } from '../types';
import { CATEGORY_LABELS } from '../types';

interface FilterSidebarProps {
  selectedCourse: string;
  onSelectCourse: (course: string) => void;
  selectedSemester: string;
  onSelectSemester: (semester: string) => void;
  selectedFaculty: string;
  onSelectFaculty: (faculty: string) => void;
  selectedCategory: MaterialType | 'all';
  onSelectCategory: (cat: MaterialType | 'all') => void;
  onResetFilters: () => void;
  availableCourses: { code: string; count: number }[];
  availableSemesters: { code: string; title: string; count: number }[];
  availableFaculties: { initial: string; count: number }[];
  categoryCounts: Record<string, number>;
  totalCount: number;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  selectedCourse,
  onSelectCourse,
  selectedSemester,
  onSelectSemester,
  selectedFaculty,
  onSelectFaculty,
  selectedCategory,
  onSelectCategory,
  onResetFilters,
  availableCourses,
  availableSemesters,
  availableFaculties,
  categoryCounts,
  totalCount
}) => {
  const isFiltered = 
    selectedCourse !== 'all' || 
    selectedSemester !== 'all' || 
    selectedFaculty !== 'all' || 
    selectedCategory !== 'all';

  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-6">
      {/* Filter Header & Reset */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <Filter className="w-4 h-4 text-purple-400" />
          <span>Filters</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
            {totalCount}
          </span>
        </div>
        {isFiltered && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          <span>Material Types</span>
        </h3>
        <div className="space-y-1.5">
          <button
            onClick={() => onSelectCategory('all')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'all'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <span>All Categories</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${selectedCategory === 'all' ? 'bg-purple-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
              {totalCount}
            </span>
          </button>

          {(Object.keys(CATEGORY_LABELS) as MaterialType[]).map((cat) => {
            const count = categoryCounts[cat] || 0;
            if (count === 0 && selectedCategory !== cat) return null;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 font-bold'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <span className="truncate">{CATEGORY_LABELS[cat].label}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 shrink-0 ml-2">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Course Filter */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span>Courses</span>
        </h3>
        <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
          <button
            onClick={() => onSelectCourse('all')}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedCourse === 'all'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-bold'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
            }`}
          >
            <span>All Courses</span>
          </button>
          {availableCourses.map((c) => (
            <button
              key={c.code}
              onClick={() => onSelectCourse(c.code)}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCourse === c.code
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-bold'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <span className="font-mono font-bold">{c.code}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400">
                {c.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Semester Filter */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          <span>Semesters</span>
        </h3>
        <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar pr-1">
          <button
            onClick={() => onSelectSemester('all')}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedSemester === 'all'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 font-bold'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
            }`}
          >
            <span>All Semesters</span>
          </button>
          {availableSemesters.map((s) => (
            <button
              key={s.code}
              onClick={() => onSelectSemester(s.code)}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedSemester === s.code
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 font-bold'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <span>{s.title}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400">
                {s.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Faculty Initial Filter */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Faculty Initial</span>
        </h3>
        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto custom-scrollbar pr-1">
          <button
            onClick={() => onSelectFaculty('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedFaculty === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          {availableFaculties.map((f) => (
            <button
              key={f.initial}
              onClick={() => onSelectFaculty(f.initial)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedFaculty === f.initial
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
              title={`${f.initial} (${f.count} materials)`}
            >
              {f.initial}
              <span className="text-[10px] text-slate-500 ml-1">({f.count})</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};
