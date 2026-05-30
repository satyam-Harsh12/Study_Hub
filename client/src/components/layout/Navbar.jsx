import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ChevronDown, User, BookOpen, FileText, Award, CreditCard, LogOut, LayoutDashboard, Settings, Calendar, X } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown.jsx';

const Navbar = () => {
  const { user, isAuthenticated, logout, getDefaultDashboard } = useAuth();
  const [open, setOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const baseLink =
    'text-sm font-medium transition-colors duration-150 px-2 py-1 rounded-md';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDashboardMenuItems = () => {
    const menuByRole = {
      admin: [
        { to: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard },
        { to: '/dashboard/admin/courses', label: 'Courses', icon: BookOpen },
        { to: '/dashboard/admin/enrollments', label: 'Enrollments', icon: FileText },
        { to: '/dashboard/admin/reports', label: 'Reports', icon: Award },
        { to: '/dashboard/admin/schedule', label: 'Schedule', icon: Calendar }
      ],
      instructor: [
        { to: '/dashboard/instructor', label: 'Overview', icon: LayoutDashboard },
        { to: '/dashboard/instructor/courses', label: 'My Courses', icon: BookOpen },
        { to: '/dashboard/instructor/assessments', label: 'Assessments', icon: FileText }
      ],
      student: [
        { to: '/dashboard/student', label: 'Overview', icon: LayoutDashboard },
        { to: '/dashboard/student/courses', label: 'My Courses', icon: BookOpen },
        { to: '/dashboard/student/assessments', label: 'Assessments', icon: FileText },
        { to: '/dashboard/student/certificates', label: 'Certificates', icon: Award },
        { to: '/dashboard/student/payments', label: 'Payments', icon: CreditCard }
      ]
    };

    return menuByRole[user?.role] || [];
  };

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    logout();
  };

  const handleMenuItemClick = (path) => {
    setProfileDropdownOpen(false);

    if (path.includes('#')) {
      const [pathname, hash] = path.split('#');
      navigate(pathname);
      // Small timeout to allow navigation to complete if changing pages
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      navigate(path);
      // If navigating to profile top (no hash), scroll to top
      if (path === '/profile') {
        window.scrollTo(0, 0);
      }
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/60 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-secondary text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
              <span className="font-bold text-lg tracking-tighter">TMS</span>
            </div>
            <div className="hidden flex-col leading-none sm:flex">
              <span className="text-base font-bold text-slate-800 tracking-tight group-hover:text-primary transition-colors">
                Training Management
              </span>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
                System
              </span>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/about-us"
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              About
            </NavLink>
            <div className="relative group">
              <button className="px-4 py-2 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 flex items-center gap-1">
                Features <ChevronDown className="h-3 w-3" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 p-2">
                <Link to="/resources" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary rounded-lg transition-colors">Resource Library</Link>
                <Link to="/live-classes" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary rounded-lg transition-colors">Live Classes</Link>
                <Link to="/mentorship" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary rounded-lg transition-colors">Mentorship</Link>
              </div>
            </div>
            <NavLink
              to="/courses"
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              Courses
            </NavLink>

            {isAuthenticated && (
              <NavLink
                to={getDefaultDashboard()}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                Dashboard
              </NavLink>
            )}

            <div className="ml-4 pl-4 border-l border-slate-200 flex items-center gap-3">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-primary transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 rounded-full bg-primary text-sm font-medium text-white shadow-lg shadow-primary/30 hover:bg-primary-dark hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <NotificationDropdown />
                  <div className="relative ml-2" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold shadow-sm group-hover:shadow-md transition-shadow">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden lg:block text-left mr-1">
                      <div className="text-xs font-semibold text-slate-700 leading-tight">{user.name}</div>
                      <div className="text-[10px] text-slate-500 capitalize leading-tight">{user.role}</div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-60 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-black/5">
                      <div className="px-5 py-3 border-b border-slate-100/50">
                        <p className="text-sm font-semibold text-slate-800">Signed in as</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>

                      <div className="py-2">
                        <button
                          onClick={() => handleMenuItemClick('/profile')}
                          className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-slate-600 hover:text-primary hover:bg-primary/5 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          Your Profile
                        </button>
                        <button
                          onClick={() => handleMenuItemClick('/profile#settings')}
                          className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-slate-600 hover:text-primary hover:bg-primary/5 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </button>
                      </div>

                      <div className="border-t border-slate-100/50 py-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center rounded-xl p-2 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
          >
            <span className="sr-only">Open main menu</span>
            {open ? (
              <X className="h-6 w-6" />
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-xl animate-in slide-in-from-top-5 duration-200">
          <div className="space-y-1 px-4 py-4">
            <NavLink
              to="/"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-xl text-base font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/courses"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-xl text-base font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              Courses
            </NavLink>

            {isAuthenticated && (
              <NavLink
                to={getDefaultDashboard()}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-xl text-base font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                Dashboard
              </NavLink>
            )}

            <div className="mt-4 pt-4 border-t border-slate-100">
              {!isAuthenticated ? (
                <div className="flex flex-col gap-3">
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="block w-full text-center px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="block w-full text-center px-4 py-3 rounded-xl bg-primary text-white font-medium shadow-lg shadow-primary/30 hover:bg-primary-dark"
                  >
                    Get Started
                  </Link>
                </div>
              ) : (
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;


