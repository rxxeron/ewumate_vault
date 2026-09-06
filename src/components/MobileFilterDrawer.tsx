import React, { useState } from 'react';
import { 
  X, 
  RotateCcw, 
  Layers, 
  BookOpen, 
  Calendar, 
  GraduationCap, 
  Check, 
  Search
} from 'lucide-react';
import { getCategoryMeta } from '../types';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCourse: string;
  onSelectCourse: (course: string) => void;
  selectedSemester: string;
  onSelectSemester: (semester: string) => void;
  selectedFaculty: string;
  onSelectFaculty: (faculty: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onResetFilters: () => void;
  availableCourses: { code: string; count: number }[];
  availableSemesters: { code: string; title: string; count: number }[];
  availableFaculties: { initial: string; count: number }[];
  availableCategories: { type: string; count: number }[];
  totalCount: number;
}

export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  isOpen,
  onClose,
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
  availableCategories,
  totalCount
}) => {
  const [activeTab, setActiveTab] = useState<'types' | 'courses' | 'semesters' | 'faculty'>('types');
  const [courseSearch, setCourseSearch] = useState('');
  const [facultySearch, setFacultySearch] = useState('');

  if (!isOpen) return null;

  const activeFiltersCount = 
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedCourse !== 'all' ? 1 : 0) +
    (selectedSemester !== 'all' ? 1 : 0) +
    (selectedFaculty !== 'all' ? 1 : 0);

  const filteredCourses = availableCourses.filter(c => 
    c.code.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const filteredFaculties = availableFaculties.filter(f => 
    f.initial.toLowerCase().includes(facultySearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-up Sheet */}
      <div className="relative w-full bg-slate-900 border-t border-slate-800 rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col z-10 animate-in slide-in-from-bottom duration-300">
        {/* Handle bar */}
        <div className="pt-3 pb-1 flex justify-center cursor-pointer" onClick={onClose}>
          <div className="w-12 h-1.5 rounded-full bg-slate-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-white">Filter Materials</span>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-xs font-bold">
                {activeFiltersCount} active
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {activeFiltersCount > 0 && (
              <button
                onClick={onResetFilters}
                className="flex items-center gap-1 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800/80 px-4 bg-slate-950/40 overflow-x-auto custom-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('types')}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'types'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Types {selectedCategory !== 'all' ? '•' : ''}</span>
          </button>

          <button
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'courses'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Course {selectedCourse !== 'all' ? '•' : ''}</span>
          </button>

          <button
            onClick={() => setActiveTab('semesters')}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'semesters'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Semester {selectedSemester !== 'all' ? '•' : ''}</span>
          </button>

          <button
            onClick={() => setActiveTab('faculty')}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'faculty'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Faculty {selectedFaculty !== 'all' ? '•' : ''}</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-2">
          {activeTab === 'types' && (
            <div className="space-y-1.5">
              <button
                onClick={() => onSelectCategory('all')}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>All Categories</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] opacity-80">{totalCount}</span>
                  {selectedCategory === 'all' && <Check className="w-4 h-4" />}
                </div>
              </button>

              {availableCategories.map(({ type, count }) => {
                const meta = getCategoryMeta(type);
                const isSelected = selectedCategory === type;
                return (
                  <button
                    key={type}
                    onClick={() => onSelectCategory(type)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 font-bold'
                        : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800/70'
                    }`}
                  >
                    <span>{meta.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-400">
                        {count}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  placeholder="Search course code..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar">
                <button
                  onClick={() => onSelectCourse('all')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${
                    selectedCourse === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>All Courses</span>
                  {selectedCourse === 'all' && <Check className="w-4 h-4" />}
                </button>

                {filteredCourses.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => onSelectCourse(c.code)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-xs transition-all ${
                      selectedCourse === c.code
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-bold'
                        : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800/70'
                    }`}
                  >
                    <span className="font-mono font-bold">{c.code}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-400">
                        {c.count} files
                      </span>
                      {selectedCourse === c.code && <Check className="w-4 h-4 text-indigo-400" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'semesters' && (
            <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar">
              <button
                onClick={() => onSelectSemester('all')}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${
                  selectedSemester === 'all'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>All Semesters</span>
                {selectedSemester === 'all' && <Check className="w-4 h-4" />}
              </button>

              {availableSemesters.map((s) => (
                <button
                  key={s.code}
                  onClick={() => onSelectSemester(s.code)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs transition-all ${
                    selectedSemester === s.code
                      ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 font-bold'
                      : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800/70'
                  }`}
                >
                  <span>{s.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-400">
                      {s.count}
                    </span>
                    {selectedSemester === s.code && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'faculty' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={facultySearch}
                  onChange={(e) => setFacultySearch(e.target.value)}
                  placeholder="Search faculty initial..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto custom-scrollbar p-1">
                <button
                  onClick={() => onSelectFaculty('all')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedFaculty === 'all'
                      ? 'bg-cyan-500 text-slate-950 font-black'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  All Faculty
                </button>

                {filteredFaculties.map((f) => (
                  <button
                    key={f.initial}
                    onClick={() => onSelectFaculty(f.initial)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                      selectedFaculty === f.initial
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                        : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{f.initial}</span>
                    <span className="text-[10px] text-slate-400">({f.count})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Apply Button */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-black shadow-lg shadow-purple-600/30 active:scale-[0.98] transition-transform"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
