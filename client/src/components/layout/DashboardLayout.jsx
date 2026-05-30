import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart,
  Bell,
  FileText,
  Calendar,
  Award,
  User,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut
} from 'lucide-react';

const erpMenu = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard', roles: ['admin', 'super_admin', 'instructor', 'student'] },
  { 
    label: 'Academics', icon: BookOpen, roles: ['admin', 'super_admin', 'instructor', 'student'],
    subItems: [
      { label: 'Subjects / Courses', to: '/academics/courses', roles: ['admin', 'super_admin'] },
      { label: 'Time Table', to: '/academics/timetable', roles: ['admin', 'super_admin'] },
      { label: 'Assignments', to: '/academics/assignments', roles: ['admin', 'super_admin', 'instructor'] },
      { label: 'Results', to: '/academics/results', roles: ['student'] },
    ]
  },
  {
    label: 'Students', icon: Users, roles: ['admin', 'super_admin', 'instructor'],
    subItems: [
      { label: 'All Students', to: '/students/list', roles: ['admin', 'super_admin', 'instructor'] },
      { label: 'Performance', to: '/students/performance', roles: ['admin', 'super_admin', 'instructor'] },
    ]
  },
  {
    label: 'Teachers', icon: User, roles: ['admin', 'super_admin'],
    subItems: [
      { label: 'All Teachers', to: '/teachers/list', roles: ['admin', 'super_admin'] },
      { label: 'Assign Subjects', to: '/teachers/assign', roles: ['admin', 'super_admin'] }
    ]
  },
  {
    label: 'Attendance', icon: Calendar, roles: ['admin', 'super_admin', 'instructor', 'student'],
    subItems: [
      { label: 'Mark Attendance', to: '/attendance/mark', roles: ['admin', 'super_admin', 'instructor'] },
      { label: 'Attendance Reports', to: '/attendance/reports', roles: ['admin', 'super_admin', 'instructor', 'student'] }
    ]
  },
  {
    label: 'Examinations', icon: Award, roles: ['admin', 'super_admin', 'instructor'],
    subItems: [
      { label: 'Marks Entry', to: '/examinations/marks', roles: ['admin', 'super_admin', 'instructor'] },
      { label: 'Result Generation', to: '/examinations/results', roles: ['admin', 'super_admin'] },
    ]
  },
  { label: 'Content / LMS', icon: BookOpen, to: '/content', roles: ['admin', 'super_admin', 'instructor', 'student'] },
  { label: 'Notifications', icon: Bell, to: '/notifications', roles: ['admin', 'super_admin', 'student'] },
  { label: 'Reports', icon: BarChart, to: '/reports', roles: ['admin', 'super_admin', 'instructor'] },
  { label: 'Audit Logs', icon: FileText, to: '/audit-logs', roles: ['admin', 'super_admin'] },
  { label: 'Settings', icon: Settings, to: '/settings', roles: ['admin', 'super_admin'] }
];

const SidebarItem = ({ item, userRole }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Check role access
  if (!item.roles.includes(userRole)) return null;

  // Filter subitems by role
  const allowedSubItems = item.subItems ? item.subItems.filter(sub => sub.roles.includes(userRole)) : [];

  if (item.subItems && allowedSubItems.length > 0) {
    return (
      <div className="mb-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <item.icon className="w-5 h-5 text-slate-500" />
            <span>{item.label}</span>
          </div>
          {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </button>
        {isOpen && (
          <div className="pl-9 pr-3 py-1 flex flex-col gap-1 border-l-2 border-slate-100 ml-4 mt-1">
            {allowedSubItems.map(subItem => (
              <NavLink
                key={subItem.to}
                to={subItem.to}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {subItem.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors mb-1 ${isActive
          ? 'bg-primary text-white'
          : 'text-slate-700 hover:bg-slate-100'
        }`
      }
    >
      <item.icon className="w-5 h-5" />
      <span>{item.label}</span>
    </NavLink>
  );
};

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userRole = user?.role?.name || user?.role || 'student';
  const displayRole = userRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6 min-h-[calc(100vh-4rem)]">
      {/* Enhanced ERP Sidebar */}
      <aside className="w-72 bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex flex-col h-[calc(100vh-6rem)] sticky top-20 overflow-y-auto">
        <div className="pb-4 mb-4 border-b border-slate-100 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-2 flex flex-col items-center justify-center">
             <User className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-sm font-bold text-slate-800">{user?.name || 'Welcome'}</h2>
          <p className="text-xs font-semibold text-primary/80 uppercase tracking-wide mt-1">
            {displayRole} Portal
          </p>
        </div>
        
        <nav className="flex-1 flex flex-col pt-2">
          {erpMenu.map(item => (
            <SidebarItem key={item.label} item={item} userRole={userRole} />
          ))}
        </nav>

        <div className="pt-4 mt-4 border-t border-slate-100">
           <button
             onClick={handleLogout}
             className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors w-full"
           >
             <LogOut className="w-5 h-5" />
             Logout
           </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 bg-white border border-slate-200 shadow-sm rounded-xl p-6 min-h-full">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
