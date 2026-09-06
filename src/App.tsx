import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { StudyMaterial, Contributor } from './types';
import { getCategoryMeta, normalizeFileType } from './types';
import { Navbar } from './components/Navbar';
import { PromoBanner } from './components/PromoBanner';
import { FilterSidebar } from './components/FilterSidebar';
import { MaterialCard } from './components/MaterialCard';
import { FilePreviewModal } from './components/FilePreviewModal';
import { ContributorProfileModal } from './components/ContributorProfileModal';
import { ContributorsPage } from './components/ContributorsPage';
import { AuthModal } from './components/AuthModal';
import { UploadModal } from './components/UploadModal';
import { UploadPage } from './components/UploadPage';
import { EWUmateModal } from './components/EWUmateModal';
import { MobileFilterDrawer } from './components/MobileFilterDrawer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { 
  Sparkles, 
  FolderSearch, 
  ChevronLeft,
  ChevronRight,
  Smartphone,
  SlidersHorizontal,
  X as XIcon,
  Search as SearchIcon
} from 'lucide-react';

const ITEMS_PER_PAGE = 24;

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active page view: 'archive' or 'contributors'
  const [currentView, setCurrentView] = useState<'archive' | 'contributors' | 'upload'>('archive');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedFaculty, setSelectedFaculty] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [previewMaterial, setPreviewMaterial] = useState<StudyMaterial | null>(null);
  const [selectedContributor, setSelectedContributor] = useState<Contributor | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Semesters list
  const [semesterMeta, setSemesterMeta] = useState<{ code: string; title: string }[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    fetchMaterials();
    fetchSemesters();

    return () => subscription.unsubscribe();
  }, []);

  const fetchSemesters = async () => {
    try {
      const { data } = await supabase
        .from('semesters')
        .select('code, title')
        .order('code', { ascending: false });
      if (data) setSemesterMeta(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMaterials = async () => {
    setIsLoading(true);
    try {
      let allData: any[] = [];
      let from = 0;
      const step = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('public_study_materials')
          .select('*')
          .order('created_at', { ascending: false })
          .range(from, from + step - 1);

        if (error) throw error;
        if (data && data.length > 0) {
          allData = allData.concat(data);
          if (data.length < step) {
            hasMore = false;
          } else {
            from += step;
          }
        } else {
          hasMore = false;
        }
      }

      setMaterials(allData as StudyMaterial[]);
    } catch (err) {
      console.error('Error loading materials:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Compute available filter options with item counts
  const { availableCourses, availableSemesters, availableFaculties, availableCategories, contributors } = useMemo(() => {
    const courseMap = new Map<string, number>();
    const semesterMap = new Map<string, number>();
    const facultyMap = new Map<string, number>();
    const catMap = new Map<string, number>();
    const uploaderMap = new Map<string, { name: string; department?: string; program?: string; count: number }>();

    materials.forEach((m) => {
      // Course
      if (m.course_code) {
        courseMap.set(m.course_code, (courseMap.get(m.course_code) || 0) + 1);
      }
      // Semester
      if (m.semester) {
        semesterMap.set(m.semester, (semesterMap.get(m.semester) || 0) + 1);
      }
      // Faculty
      if (m.faculty_initial && m.faculty_initial !== 'GENERAL') {
        facultyMap.set(m.faculty_initial, (facultyMap.get(m.faculty_initial) || 0) + 1);
      }
      // Category / File Type
      if (m.file_type) {
        const norm = normalizeFileType(m.file_type);
        catMap.set(norm, (catMap.get(norm) || 0) + 1);
      }

      // Uploader
      if (m.uploader_id) {
        const existing = uploaderMap.get(m.uploader_id);
        if (existing) {
          existing.count += 1;
        } else {
          uploaderMap.set(m.uploader_id, {
            name: m.uploader_name || 'Anonymous Student',
            department: m.uploader_department,
            program: m.uploader_program,
            count: 1
          });
        }
      }
    });

    const courses = Array.from(courseMap.entries())
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count);

    const semesters = Array.from(semesterMap.entries())
      .map(([code, count]) => {
        const found = semesterMeta.find((s) => s.code === code);
        return {
          code,
          title: found?.title || code.toUpperCase(),
          count
        };
      })
      .sort((a, b) => b.code.localeCompare(a.code));

    const faculties = Array.from(facultyMap.entries())
      .map(([initial, count]) => ({ initial, count }))
      .sort((a, b) => b.count - a.count);

    const categories = Array.from(catMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    // Filter out Admin (Md. Rakibul Hasan / bd73b4d7-d922-458f-a52c-40e30e148bf4)
    const contribs: Contributor[] = Array.from(uploaderMap.entries())
      .filter(([uploader_id, data]) => {
        const lowerName = data.name.toLowerCase();
        const isAdmin = 
          uploader_id === 'bd73b4d7-d922-458f-a52c-40e30e148bf4' ||
          lowerName.includes('rakibul hasan') ||
          lowerName.includes('rxxeron');
        return !isAdmin;
      })
      .map(([uploader_id, data]) => {
        let badge: Contributor['badge'] = 'Scholar';
        if (data.count >= 15) badge = 'Pioneer';
        else if (data.count >= 8) badge = 'Master Contributor';
        else if (data.count >= 3) badge = 'Rising Star';

        return {
          uploader_id,
          name: data.name,
          department: data.department,
          program: data.program,
          upload_count: data.count,
          badge
        };
      })
      .sort((a, b) => b.upload_count - a.upload_count);

    return {
      availableCourses: courses,
      availableSemesters: semesters,
      availableFaculties: faculties,
      availableCategories: categories,
      contributors: contribs
    };
  }, [materials, semesterMeta]);

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = m.file_name.toLowerCase().includes(q);
        const matchesCourse = m.course_code.toLowerCase().includes(q);
        const matchesFaculty = m.faculty_initial.toLowerCase().includes(q);
        if (!matchesName && !matchesCourse && !matchesFaculty) return false;
      }
      if (selectedCourse !== 'all' && m.course_code !== selectedCourse) return false;
      if (selectedSemester !== 'all' && m.semester !== selectedSemester) return false;
      if (selectedFaculty !== 'all' && m.faculty_initial !== selectedFaculty) return false;
      if (selectedCategory !== 'all' && normalizeFileType(m.file_type) !== selectedCategory) return false;

      return true;
    });
  }, [materials, searchQuery, selectedCourse, selectedSemester, selectedFaculty, selectedCategory]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCourse, selectedSemester, selectedFaculty, selectedCategory]);

  // Paginated materials
  const totalPages = Math.max(1, Math.ceil(filteredMaterials.length / ITEMS_PER_PAGE));
  const paginatedMaterials = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMaterials.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMaterials, currentPage]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCourse('all');
    setSelectedSemester('all');
    setSelectedFaculty('all');
    setSelectedCategory('all');
    setCurrentPage(1);
  };

  const handleOpenContributorFromCard = async (uploaderId: string, fallbackName?: string) => {
    // 1. Calculate count & rank across all vault materials
    const userMaterials = materials.filter((m) => m.uploader_id === uploaderId);
    const count = userMaterials.length;

    // Calculate all-time rank among uploaders
    const uploaderCounts = new Map<string, number>();
    materials.forEach((m) => {
      if (m.uploader_id) {
        uploaderCounts.set(m.uploader_id, (uploaderCounts.get(m.uploader_id) || 0) + 1);
      }
    });
    const sortedUploaders = Array.from(uploaderCounts.entries()).sort((a, b) => b[1] - a[1]);
    const rankIndex = sortedUploaders.findIndex(([id]) => id === uploaderId);
    const rank = rankIndex !== -1 ? rankIndex + 1 : (count > 0 ? 1 : null);

    let badge: Contributor['badge'] = 'Scholar';
    if (count >= 15) badge = 'Pioneer';
    else if (count >= 8) badge = 'Master Contributor';
    else if (count >= 3) badge = 'Rising Star';

    // 2. Fetch full student profile from database
    let profileData: any = null;
    try {
      const { data } = await supabase
        .from('public_profiles')
        .select('id, full_name, department_name, program_name, photo_url')
        .eq('id', uploaderId)
        .maybeSingle();
      profileData = data;
    } catch (e) {
      console.warn('Could not fetch profile directly:', e);
    }

    const sample = userMaterials[0];
    const resolvedName = 
      profileData?.full_name || 
      fallbackName || 
      sample?.uploader_name || 
      (user?.id === uploaderId ? (user.user_metadata?.full_name || user.user_metadata?.fullName || user.email?.split('@')[0]) : null) ||
      'EWU Student';

    setSelectedContributor({
      uploader_id: uploaderId,
      name: resolvedName,
      department: profileData?.department_name || sample?.uploader_department,
      program: profileData?.program_name || sample?.uploader_program,
      photo_url: profileData?.photo_url,
      upload_count: count,
      rank,
      badge
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white">
      {/* 1. EWUmate Companion App Sticky Banner */}
      <PromoBanner onOpenAppModal={() => setIsAppModalOpen(true)} />

      {/* 2. Global Navbar */}
      <Navbar
        user={user}
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenMyProfile={() => {
          if (user) {
            handleOpenContributorFromCard(user.id, user.user_metadata?.full_name || user.email?.split('@')[0] || 'My Profile');
          }
        }}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAppModal={() => setIsAppModalOpen(true)}
        onSignOut={async () => {
          await supabase.auth.signOut();
          setUser(null);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalMaterialsCount={materials.length}
      />

      {/* 3. Conditional Page View */}
      {currentView === 'upload' ? (
        <UploadPage
          user={user}
          onNavigateBack={() => setCurrentView('archive')}
          onRequireAuth={() => setIsAuthOpen(true)}
          onUploadSuccess={() => {
            fetchMaterials();
          }}
        />
      ) : currentView === 'contributors' ? (
        <ContributorsPage
          contributors={contributors}
          onBack={() => setCurrentView('archive')}
          onSelectContributor={(c) => setSelectedContributor(c)}
          onOpenUpload={() => setCurrentView('upload')}
        />
      ) : (
        /* Archive Explorer View */
        <>
          {/* Hero Header Section */}
          <section className="relative pt-6 sm:pt-10 pb-5 sm:pb-8 px-4 sm:px-6 max-w-7xl mx-auto w-full overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-10 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-black uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Open Study Archive For East West University</span>
              </div>

              <h1 className="text-2xl sm:text-5xl font-black tracking-tight text-white leading-tight sm:leading-snug">
                Access East West University{' '}
                <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                  Past Questions & Slides
                </span>
              </h1>

              <p className="text-slate-400 text-sm sm:text-base mt-3 max-w-2xl mx-auto">
                Browse, search, and download thousands of verified mid/final questions, lecture notes, lab manuals, and course outlines organized by semester and instructor.
              </p>

              {/* Quick Metrics */}
              <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-8 max-w-lg mx-auto">
                <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div className="text-xl sm:text-2xl font-black text-purple-400">{materials.length}</div>
                  <div className="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    Files in Vault
                  </div>
                </div>
                <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div className="text-xl sm:text-2xl font-black text-indigo-400">{availableCourses.length}</div>
                  <div className="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    Courses
                  </div>
                </div>
                <div 
                  onClick={() => setCurrentView('contributors')}
                  className="p-3 sm:p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all group"
                  title="Click to view Contributors Page"
                >
                  <div className="text-xl sm:text-2xl font-black text-cyan-400 group-hover:scale-105 transition-transform">
                    {contributors.length}
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5 group-hover:text-cyan-300 transition-colors">
                    Top Contributors →
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Main Explorer Layout */}
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pb-24 sm:pb-16">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Desktop Sidebar Filter Panel */}
              <div className="hidden lg:block w-72 shrink-0">
                <FilterSidebar
                  selectedCourse={selectedCourse}
                  onSelectCourse={setSelectedCourse}
                  selectedSemester={selectedSemester}
                  onSelectSemester={setSelectedSemester}
                  selectedFaculty={selectedFaculty}
                  onSelectFaculty={setSelectedFaculty}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  onResetFilters={handleResetFilters}
                  availableCourses={availableCourses}
                  availableSemesters={availableSemesters}
                  availableFaculties={availableFaculties}
                  availableCategories={availableCategories}
                  totalCount={materials.length}
                />
              </div>

              {/* Material Grid / Results */}
              <div className="flex-1 w-full min-w-0">
                {/* Mobile Filter & Search Bar */}
                <div className="lg:hidden mb-5 space-y-3">
                  {/* Search Bar & Filter Button */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search materials, codes (CSE106)..."
                        className="w-full h-11 pl-10 pr-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 shadow-sm"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                        >
                          <XIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => setIsMobileFilterOpen(true)}
                      className={`h-11 px-3.5 rounded-2xl border flex items-center gap-2 text-xs font-bold transition-all shrink-0 active:scale-95 ${
                        (selectedCategory !== 'all' || selectedCourse !== 'all' || selectedSemester !== 'all' || selectedFaculty !== 'all')
                          ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <SlidersHorizontal className="w-4 h-4 text-purple-400" />
                      <span>Filters</span>
                      {(selectedCategory !== 'all' || selectedCourse !== 'all' || selectedSemester !== 'all' || selectedFaculty !== 'all') && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      )}
                    </button>
                  </div>

                  {/* Horizontal Scrollable Quick Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                        selectedCategory === 'all'
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                          : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800/80'
                      }`}
                    >
                      All
                    </button>

                    {availableCategories.slice(0, 8).map(({ type, count }) => {
                      const meta = getCategoryMeta(type);
                      const isSelected = selectedCategory === type;
                      return (
                        <button
                          key={type}
                          onClick={() => setSelectedCategory(type)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50 font-bold'
                              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800/80'
                          }`}
                        >
                          <span>{meta.label}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({count})</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Filter Chips */}
                  {(selectedCourse !== 'all' || selectedFaculty !== 'all' || selectedSemester !== 'all' || selectedCategory !== 'all') && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[11px] text-slate-500 font-semibold">Active:</span>
                      {selectedCourse !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold">
                          {selectedCourse}
                          <button onClick={() => setSelectedCourse('all')} className="hover:text-white">
                            <XIcon className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {selectedSemester !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                          {selectedSemester}
                          <button onClick={() => setSelectedSemester('all')} className="hover:text-white">
                            <XIcon className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {selectedFaculty !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold">
                          {selectedFaculty}
                          <button onClick={() => setSelectedFaculty('all')} className="hover:text-white">
                            <XIcon className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {selectedCategory !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-bold">
                          {getCategoryMeta(selectedCategory).label}
                          <button onClick={() => setSelectedCategory('all')} className="hover:text-white">
                            <XIcon className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      <button
                        onClick={handleResetFilters}
                        className="text-[11px] text-purple-400 hover:text-purple-300 underline ml-1 font-semibold"
                      >
                        Reset all
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold flex-wrap">
                    <span>
                      Showing <strong className="text-white font-mono">{filteredMaterials.length}</strong> materials
                      {totalPages > 1 && (
                        <span> (Page {currentPage} of {totalPages})</span>
                      )}
                    </span>
                    {selectedCourse !== 'all' && (
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        Course: {selectedCourse}
                      </span>
                    )}
                    {selectedFaculty !== 'all' && (
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        Faculty: {selectedFaculty}
                      </span>
                    )}
                    {selectedCategory !== 'all' && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        Type: {getCategoryMeta(selectedCategory).label}
                      </span>
                    )}
                  </div>


                </div>

                {/* Grid */}
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <div key={n} className="h-48 rounded-3xl bg-slate-900/40 border border-slate-800 animate-pulse" />
                    ))}
                  </div>
                ) : paginatedMaterials.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {paginatedMaterials.map((item) => (
                        <MaterialCard
                          key={item.id}
                          material={item}
                          onPreview={setPreviewMaterial}
                          onSelectCourse={setSelectedCourse}
                          onSelectFaculty={setSelectedFaculty}
                          onOpenContributor={handleOpenContributorFromCard}
                        />
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-bold flex items-center gap-1"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Previous</span>
                        </button>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(page => {
                              // Show first, last, and window around current page
                              return (
                                page === 1 ||
                                page === totalPages ||
                                Math.abs(page - currentPage) <= 1
                              );
                            })
                            .map((page, idx, arr) => {
                              const prev = arr[idx - 1];
                              const showEllipsis = prev && page - prev > 1;

                              return (
                                <React.Fragment key={page}>
                                  {showEllipsis && (
                                    <span className="px-2 text-slate-600 text-xs font-mono">...</span>
                                  )}
                                  <button
                                    onClick={() => {
                                      setCurrentPage(page);
                                      window.scrollTo({ top: 400, behavior: 'smooth' });
                                    }}
                                    className={`w-9 h-9 rounded-xl text-xs font-mono font-bold transition-all ${
                                      currentPage === page
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-black'
                                        : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                                  >
                                    {page}
                                  </button>
                                </React.Fragment>
                              );
                            })}
                        </div>

                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-bold flex items-center gap-1"
                        >
                          <span>Next</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center flex flex-col items-center justify-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mb-4">
                      <FolderSearch className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">No Matching Materials Found</h3>
                    <p className="text-xs text-slate-400 max-w-sm mb-5">
                      We couldn't find any documents matching your active filter criteria. Try clearing some filters or searching with different keywords!
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white text-xs font-bold transition-all border border-purple-500/30"
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </main>
        </>
      )}

      {/* 4. Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white font-black text-sm">
              EM
            </div>
            <div>
              <p className="text-xs font-bold text-white">EWUmate Vault • vault.ewumate.pro.bd</p>
              <p className="text-[11px] text-slate-400">Part of the official EWUmate Student Productivity Suite</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <button 
              onClick={() => setIsAppModalOpen(true)}
              className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>EWUmate App</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setCurrentView('contributors')}
              className="hover:text-white"
            >
              Top Contributors
            </button>
            <span>•</span>
            <a href="https://services.ewumate.pro.bd" target="_blank" rel="noreferrer" className="hover:text-white">
              Cover Page Generator
            </a>
            <span>•</span>
            <a href="https://ewumate.pro.bd" target="_blank" rel="noreferrer" className="hover:text-white">
              Main Portal
            </a>
          </div>

          <p className="text-[11px] text-slate-500 font-mono">
            Crafted for East West University Students
          </p>
        </div>
      </footer>

      {/* 5. Modals */}
      <FilePreviewModal
        material={previewMaterial}
        onClose={() => setPreviewMaterial(null)}
      />

      {selectedContributor && (
        <ContributorProfileModal
          contributor={selectedContributor}
          allContributors={contributors}
          materials={materials}
          onClose={() => setSelectedContributor(null)}
          onPreview={setPreviewMaterial}
          onOpenUpload={() => setCurrentView('upload')}
        />
      )}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(u) => setUser(u)}
        onOpenAppModal={() => setIsAppModalOpen(true)}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        user={user}
        onRequireAuth={() => setIsAuthOpen(true)}
        onOpenAppModal={() => setIsAppModalOpen(true)}
        onUploadSuccess={() => {
          fetchMaterials();
        }}
      />

      <EWUmateModal
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
      />

      {/* Mobile Filter Sheet Drawer */}
      <MobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        selectedCourse={selectedCourse}
        onSelectCourse={setSelectedCourse}
        selectedSemester={selectedSemester}
        onSelectSemester={setSelectedSemester}
        selectedFaculty={selectedFaculty}
        onSelectFaculty={setSelectedFaculty}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onResetFilters={handleResetFilters}
        availableCourses={availableCourses}
        availableSemesters={availableSemesters}
        availableFaculties={availableFaculties}
        availableCategories={availableCategories}
        totalCount={materials.length}
      />

      {/* Mobile Native-Style Bottom Navigation Bar */}
      <MobileBottomNav
        currentView={currentView}
        onNavigate={setCurrentView}
        user={user}
        onOpenMyProfile={() => {
          if (user) {
            handleOpenContributorFromCard(user.id, user.user_metadata?.full_name || user.email?.split('@')[0] || 'My Profile');
          }
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
      />
    </div>
  );
};
