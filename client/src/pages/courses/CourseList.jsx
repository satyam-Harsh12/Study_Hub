import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { listCoursesApi } from '../../api/courseApi.js';
import { Search, Filter, BookOpen, ChevronRight, Star, Clock, Users } from 'lucide-react';

// Define the hierarchy outside the component to avoid re-creation
const HIERARCHY = {
  'Skill Courses': ['Web Development', 'Data Science & AI', 'UI/UX Design', 'Digital Marketing'],
  'Competitive Exams': ['JEE Mains & Advanced', 'NEET', 'UPSC CSE', 'GATE'],
  'School Classes': ['Class 12 - Science', 'Class 12 - Commerce', 'Class 10 - Foundation', 'Olympiads']
};

const getCourseImage = (category) => {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('web')) return 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600';
  if (cat.includes('data')) return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600';
  if (cat.includes('ui') || cat.includes('design')) return 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=600';
  if (cat.includes('marketing')) return 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?auto=format&fit=crop&q=80&w=600';
  if (cat.includes('jee') || cat.includes('neet') || cat.includes('exam') || cat.includes('gate') || cat.includes('upsc')) return 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=600';
  if (cat.includes('class') || cat.includes('school') || cat.includes('olympiad')) return 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600';
  return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600';
};

const CourseList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Two-level state
  const [selectedPath, setSelectedPath] = useState('Skill Courses'); // Default to first tab
  const [selectedDomain, setSelectedDomain] = useState('');

  // Initialize state from URL on mount
  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) {
      // Check if it's a specific domain (single value)
      if (!catParam.includes(',')) {
        // Find which path this domain belongs to
        const foundPath = Object.keys(HIERARCHY).find(path =>
          HIERARCHY[path].includes(catParam)
        );
        if (foundPath) {
          setSelectedPath(foundPath);
          setSelectedDomain(catParam);
        }
      } else {
        // It's a list (likely "All" of a path was selected previously)
        const paramDomains = catParam.split(',');
        const foundPath = Object.keys(HIERARCHY).find(path => {
          const pathDomains = HIERARCHY[path];
          return pathDomains.includes(paramDomains[0]);
        });
        if (foundPath) {
          setSelectedPath(foundPath);
          setSelectedDomain('');
        }
      }
    }
  }, [searchParams]);

  // Handle Fetching
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        let categoryQuery = '';

        if (selectedDomain) {
          categoryQuery = selectedDomain;
        } else if (selectedPath) {
          categoryQuery = HIERARCHY[selectedPath].join(',');
        }

        const res = await listCoursesApi({
          search: search || undefined,
          category: categoryQuery || undefined
        });
        setCourses(res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [search, selectedPath, selectedDomain]);

  const handlePathChange = (path) => {
    setSelectedPath(path);
    setSelectedDomain(''); // Reset domain when path changes
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Dynamic Animated Hero Section */}
      <div className="relative bg-slate-900 pt-20 pb-32 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-yellow-500/30 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-500/30 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center z-10">
          <span className="inline-block py-1 px-3 rounded-full bg-slate-800/80 border border-slate-700 text-purple-300 text-sm font-medium mb-6 backdrop-blur-sm animate-fade-in-up">
            🚀 Launch your career today
          </span>

          <h1 className="text-5xl md:text-7xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-blue-200 mb-6 tracking-tight animate-fade-in-up animation-delay-100">
            Unlock Your <br className="hidden md:block" />
            <span className="text-white">True Potential</span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up animation-delay-200">
            Join a community of learners and master the skills that matter. From coding to creative arts, start your journey with expert-led courses.
          </p>

          {/* Search Bar - Floating */}
          <div className="max-w-xl mx-auto relative group animate-fade-in-up animation-delay-300">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl p-2">
              <Search className="h-6 w-6 text-slate-400 ml-3" />
              <input
                type="text"
                placeholder="What do you want to learn today?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 w-full bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 px-4 py-3 text-base"
              />
              <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:shadow-lg hover:from-purple-500 hover:to-blue-500 transition-all duration-300 transform hover:-translate-y-0.5">
                Search
              </button>
            </div>
          </div>

          {/* Quick Tags */}
          <div className="mt-8 flex flex-wrap justify-center gap-3 animate-fade-in-up animation-delay-400">
            {['Python', 'Web Dev', 'Data Science', 'Marketing'].map((tag) => (
              <button
                key={tag}
                onClick={() => setSearch(tag)}
                className="text-xs font-medium text-slate-400 bg-slate-800/40 border border-slate-700/30 px-4 py-1.5 rounded-full hover:bg-slate-700 hover:text-white transition-all duration-300 cursor-pointer backdrop-blur-sm"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">

        {/* Navigation Tabs (Path Level) */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-2 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex p-1 gap-1 overflow-x-auto w-full md:w-auto scrollbar-hide">
            {Object.keys(HIERARCHY).map((path) => (
              <button
                key={path}
                onClick={() => handlePathChange(path)}
                className={`px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${selectedPath === path
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                {path}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500 pr-4 hidden md:flex">
            <Filter className="w-4 h-4" />
            <span>Filter by Category</span>
          </div>
        </div>

        {/* Domain Chips (Level 2) - Dependent on selectedPath */}
        {selectedPath && (
          <div className="mb-10 flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setSelectedDomain('')}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${!selectedDomain
                ? 'bg-primary/10 border-primary/20 text-primary'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
            >
              All {selectedPath}
            </button>
            {HIERARCHY[selectedPath].map((domain) => (
              <button
                key={domain}
                onClick={() => setSelectedDomain(domain)}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${selectedDomain === domain
                  ? 'bg-primary/10 border-primary/20 text-primary'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
              >
                {domain}
              </button>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-slate-500 animate-pulse">Finding the best courses for you...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-center mb-8">
            {error}
          </div>
        )}

        {/* Course Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {courses.map((course) => (
              <Link
                key={course._id}
                to={`/courses/${course._id}`}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1"
              >
                {/* Card Image Header */}
                <div className="h-48 bg-slate-100 relative overflow-hidden">
                  {/* Placeholder gradient based on category if no image */}
                  <img
                    src={getCourseImage(course.category)}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60"></div>

                  {/* Overlay Tag */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      {course.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-2">
                      {course.title}
                    </h2>
                  </div>

                  <p className="text-slate-500 text-sm mb-6 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Metadata Row */}
                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-6 mt-auto">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-slate-600 font-bold">4.8</span>
                      <span>(120)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>12h 30m</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>1.2k</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">Price</p>
                      {course.isPaid ? (
                        <span className="text-xl font-bold text-slate-900">₹{course.price.toLocaleString()}</span>
                      ) : (
                        <span className="text-xl font-bold text-emerald-600">Free</span>
                      )}
                    </div>
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && !error && courses.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No courses found</h3>
            <p className="text-slate-500 mb-6">We couldn't find any courses matching your current filters.</p>
            <button
              onClick={() => { setSelectedPath('Skill Courses'); setSelectedDomain(''); setSearch('') }}
              className="text-primary font-bold hover:underline"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default CourseList;


