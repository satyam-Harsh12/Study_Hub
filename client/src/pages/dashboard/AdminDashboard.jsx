import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats, getAdminCourses } from '../../api/adminApi.js';
import { getTodayAttendance, markAttendance, getLeaveRequests, updateLeaveStatus } from '../../api/attendanceApi.js';
import NotificationPanel from '../../components/dashboard/NotificationPanel';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import PendingApprovalsWidget from '../../components/dashboard/PendingApprovalsWidget';
import { CheckCircle, XCircle, Clock, AlertTriangle, Calendar, BookOpen, UserCheck, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  // ... existing code ...

  // ... inside the return statement ...
  <Link to="/dashboard/admin/courses" className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-blue-50 hover:border-blue-200 transition">
    <div className="font-medium text-slate-800 text-sm">Manage Courses</div>
  </Link>
  const [stats, setStats] = useState({
    students: 0,
    instructors: 0,
    courses: 0,
    totalRevenue: 0
  });
  const [attendanceData, setAttendanceData] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAttendancePopup, setShowAttendancePopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, attendanceRes, leavesRes, coursesRes] = await Promise.all([
          getAdminStats(),
          getTodayAttendance(),
          getLeaveRequests(),
          getAdminCourses()
        ]);

        setStats(statsRes.data || stats);
        setAttendanceData(attendanceRes.data || []);
        setPendingLeaves((leavesRes.data || []).filter(l => l.status === 'Pending'));

        // Extract today's sessions
        const sessions = [];
        const nowStr = new Date().toDateString();
        (coursesRes.data || []).forEach(course => {
          (course.schedule || []).forEach(slot => {
            if (new Date(slot.date).toDateString() === nowStr) {
              sessions.push({ ...slot, courseTitle: course.title, instructorName: course.instructor?.name });
            }
          });
        });
        sessions.sort((a, b) => a.startTime.localeCompare(b.startTime));
        setTodaySchedule(sessions);

        // Show popup...
        const absentees = attendanceRes.data.filter(a => a.status === 'Absent' || a.status === 'Not Marked');
        if (absentees.length > 0) {
          setShowAttendancePopup(true);
        }

      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAttendanceUpdate = async (instructorId, status, type = 'Full Day', hours = []) => {
    try {
      await markAttendance({ instructorId, status, type, hours });
      // Update local state
      setAttendanceData(prev => prev.map(rec =>
        rec.instructor._id === instructorId
          ? { ...rec, status, type, hours }
          : rec
      ));
      setPopupMessage('Attendance updated.');
      setTimeout(() => setPopupMessage(''), 2000);
    } catch (err) {
      console.error(err);
      setPopupMessage('Failed to update.');
    }
  };

  const handleLeaveAction = async (id, status) => {
    try {
      await updateLeaveStatus(id, { status, adminComment: `Marked by Admin` });
      setPendingLeaves(prev => prev.filter(l => l._id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  const absentees = attendanceData.filter(a => a.status === 'Absent' || a.status === 'Not Marked');

  return (
    <div className="space-y-6">

      {/* Attendance Popup Modal */}
      {showAttendancePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white text-slate-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-red-50">
              <h2 className="text-lg font-bold text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Daily Attendance Alert
              </h2>
              <button onClick={() => setShowAttendancePopup(false)} className="text-slate-500 hover:text-slate-700">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <p className="mb-4 text-sm text-slate-600">
                The following instructors have not marked attendance or are marked absent for today ({new Date().toLocaleDateString()}).
                Please update their status.
              </p>

              {popupMessage && (
                <div className="mb-3 p-2 bg-blue-50 text-blue-700 text-xs rounded text-center">
                  {popupMessage}
                </div>
              )}

              <div className="space-y-4">
                {absentees.map((record) => (
                  <div key={record.instructor._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 gap-4">
                    <div>
                      <div className="font-semibold">{record.instructor.name}</div>
                      <div className="text-xs text-slate-500">{record.instructor.email}</div>
                      <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-800">
                        {record.status}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleAttendanceUpdate(record.instructor._id, 'Absent', 'Full Day')}
                        className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-100 text-red-700 hover:bg-red-200 border border-red-200"
                      >
                        Mark Absent
                      </button>
                      <button
                        onClick={() => handleAttendanceUpdate(record.instructor._id, 'Present', 'Full Day')}
                        className="px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200"
                      >
                        Mark Present
                      </button>
                      <button
                        onClick={() => handleAttendanceUpdate(record.instructor._id, 'Leave', 'Full Day')}
                        className="px-3 py-1.5 text-xs font-medium rounded-md bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200"
                      >
                        Full Day Leave
                      </button>
                      {/* Hourly logic could be more complex UI, skipping for specific detailed component */}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
              <button
                onClick={() => setShowAttendancePopup(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-md text-sm hover:bg-slate-900"
              >
                Close & Review Later
              </button>
            </div>
          </div>
        </div>
      )}


      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{isSuperAdmin ? 'Super Admin Control Panel' : 'Training Center Control Panel'}</h1>
          <p className="text-sm text-slate-500">Monitor key metrics and manage academy operations.</p>
        </div>
      </div>

      {isSuperAdmin && (
        <PendingApprovalsWidget />
      )}

      {/* Leave Requests Widget */}
      {pendingLeaves.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-bold text-amber-800 flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4" />
            Pending Leave Requests
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pendingLeaves.map(req => (
              <div key={req._id} className="bg-white p-3 rounded-lg border border-amber-100 shadow-sm text-sm">
                <div className="font-semibold text-slate-900">{req.instructor.name}</div>
                <div className="text-xs text-slate-500 mb-2">
                  {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                  <span className="ml-2 px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">{req.leaveType}</span>
                </div>
                <p className="text-xs text-slate-700 italic mb-3">"{req.reason}"</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLeaveAction(req._id, 'Approved')}
                    className="flex-1 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium hover:bg-emerald-200"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleLeaveAction(req._id, 'Rejected')}
                    className="flex-1 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-4 rounded-2xl text-white shadow-lg transform transition hover:scale-[1.02]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wider text-indigo-100">Total Students</p>
              <h3 className="text-3xl font-bold mt-1">{loading ? '...' : stats.students}</h3>
              <p className="text-[10px] text-indigo-200 mt-2 flex items-center gap-1">
                <span className="bg-white/20 px-1 rounded">+12%</span> from last month
              </p>
            </div>
            <div className="p-2 bg-white/10 rounded-lg">
              <BookOpen className="w-5 h-5 text-indigo-100" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm transform transition hover:scale-[1.02]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Instructors</p>
              <h3 className="text-3xl font-bold mt-1 text-slate-900">{loading ? '...' : stats.instructors}</h3>
              <p className="text-[10px] text-emerald-600 mt-2 flex items-center gap-1">
                Active & Verified
              </p>
            </div>
            <div className="p-2 bg-slate-100 rounded-lg">
              <UserCheck className="w-5 h-5 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm transform transition hover:scale-[1.02]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Live Courses</p>
              <h3 className="text-3xl font-bold mt-1 text-slate-900">{loading ? '...' : stats.courses}</h3>
              <p className="text-[10px] text-slate-400 mt-2">Across 5 categories</p>
            </div>
            <div className="p-2 bg-slate-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm transform transition hover:scale-[1.02]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Total Revenue</p>
              <h3 className="text-3xl font-bold mt-1 text-emerald-600">{loading ? '...' : `₹${stats.totalRevenue?.toLocaleString()}`}</h3>
              <p className="text-[10px] text-emerald-600 mt-2 flex items-center gap-1">
                +8.5% growth
              </p>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <CreditCard className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics & Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-slate-900">Revenue & Enrollment Analytics</h3>
            <select className="text-xs border-slate-200 rounded-md text-slate-500">
              <option>This Year</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between px-4 gap-2">
            {/* Mock Chart Bars - In a real app use Recharts */}
            {[45, 60, 35, 78, 90, 65, 70, 85, 95, 60, 75, 80].map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-2 w-full group cursor-pointer">
                <div
                  className="w-full bg-indigo-100 rounded-t-sm relative group-hover:bg-indigo-500 transition-all duration-300"
                  style={{ height: `${h}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    ₹{(h * 1500).toLocaleString()}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="h-[400px]">
          <ActivityFeed />
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/dashboard/admin/courses" className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-blue-50 hover:border-blue-200 transition">
              <div className="font-medium text-slate-800 text-sm">Manage Courses</div>
            </Link>
            <a href="/dashboard/admin/instructors" className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-blue-50 hover:border-blue-200 transition">
              <div className="font-medium text-slate-800 text-sm">Manage Instructors</div>
            </a>
            <a href="/dashboard/admin/reports" className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-blue-50 hover:border-blue-200 transition">
              <div className="font-medium text-slate-800 text-sm">View Analytics</div>
            </a>
            <a href="/dashboard/admin/schedule" className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-blue-50 hover:border-blue-200 transition">
              <div className="font-medium text-slate-800 text-sm">Update Schedule</div>
            </a>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            Today's Academy Timetable
          </h3>
          <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2">
            {todaySchedule.length === 0 ? (
              <div className="py-8 text-center text-slate-400 italic text-sm">
                No classes scheduled for today.
              </div>
            ) : (
              todaySchedule.map((session, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-tight">{session.startTime} - {session.endTime}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-500 font-medium">{session.courseTitle}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-800">{session.topic}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    Instructor: {session.instructorName || 'Lead'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-semibold text-slate-900 mb-4">Latest Notifications</h3>
        <NotificationPanel />
      </div>

    </div>
  );
};

export default AdminDashboard;
