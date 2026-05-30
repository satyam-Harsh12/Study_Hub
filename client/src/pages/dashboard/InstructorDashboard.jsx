
import React, { useEffect, useState } from 'react';
import NotificationPanel from '../../components/dashboard/NotificationPanel';
import { getTodayAttendance, markAttendance, applyLeave, getLeaveRequests } from '../../api/attendanceApi.js';
import { getMyCoursesApi } from '../../api/courseApi.js';
import { Calendar, CheckCircle, Clock, AlertTriangle, X, BookOpen, FileText, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const InstructorDashboard = () => {
  const [attendance, setAttendance] = useState(null);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [message, setMessage] = useState('');

  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'Full Day',
    startDate: '',
    endDate: '',
    reason: '',
    hours: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [attRes, reqRes, courseRes] = await Promise.all([
        getTodayAttendance(),
        getLeaveRequests(),
        getMyCoursesApi()
      ]);

      setAttendance(attRes.data);
      setLeaveRequests(reqRes.data || []);

      // Extract today's sessions
      const sessions = [];
      const nowStr = new Date().toDateString();
      (courseRes.data || []).forEach(course => {
        (course.schedule || []).forEach(slot => {
          if (new Date(slot.date).toDateString() === nowStr) {
            sessions.push({ ...slot, courseTitle: course.title });
          }
        });
      });
      sessions.sort((a, b) => a.startTime.localeCompare(b.startTime));
      setTodaySchedule(sessions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async () => {
    try {
      const res = await markAttendance({ status: 'Present', type: 'Full Day' });
      setAttendance(res.data);
      setMessage('Marked Present successfully!');
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    try {
      await applyLeave(leaveForm);
      setMessage('Leave request submitted.');
      setShowLeaveForm(false);
      setLeaveForm({ leaveType: 'Full Day', startDate: '', endDate: '', reason: '', hours: [] });
      loadData(); // refresh requests
    } catch (err) {
      console.error(err);
      setMessage('Failed to submit leave request.');
    }
  };

  const isBefore9AM = new Date().getHours() < 9;
  const canMark = isBefore9AM && (!attendance || attendance.status === 'Not Marked');

  // Available slots based on 9-5 working hours
  const availableHours = [9, 10, 11, 12, 14, 15, 16];
  const formatHour = (h) => `${h % 12 || 12}:00 ${h >= 12 ? 'PM' : 'AM'}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Instructor Overview</h1>
          <p className="text-sm text-slate-500">Track your courses, attendance, and leave requests.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            {/* Attendance Status Badge */}
            <div className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 border ${attendance?.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              attendance?.status === 'Absent' ? 'bg-red-50 text-red-700 border-red-200' :
                attendance?.status === 'Leave' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-slate-50 text-slate-600 border-slate-200'
              }`}>
              {attendance?.status === 'Present' ? <CheckCircle className="w-4 h-4" /> :
                attendance?.status === 'Absent' ? <X className="w-4 h-4" /> :
                  <Clock className="w-4 h-4" />}
              Status: {attendance?.status || 'Not Marked'}
            </div>

            {canMark && (
              <button
                onClick={handleMarkAttendance}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Mark Attendance
              </button>
            )}
          </div>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-100 flex items-center gap-2">
          <span className="font-bold">Notice:</span> {message}
        </div>
      )}

      {/* Attendance & Leave Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Leave Stats / Request */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800">Leave Management</h2>
            <button
              onClick={() => setShowLeaveForm(!showLeaveForm)}
              className="text-sm text-indigo-600 font-medium hover:text-indigo-800"
            >
              {showLeaveForm ? 'Cancel' : '+ Request Leave'}
            </button>
          </div>

          {showLeaveForm ? (
            <form onSubmit={handleLeaveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Leave Type</label>
                <select
                  value={leaveForm.leaveType}
                  onChange={e => setLeaveForm({ ...leaveForm, leaveType: e.target.value, hours: [], halfDayType: 'Morning' })}
                  className="w-full text-sm border-slate-300 rounded-md py-1.5 focus:ring-indigo-500 max-w-xs"
                >
                  <option value="Full Day">Full Day</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Hourly">Hourly</option>
                </select>
              </div>

              {leaveForm.leaveType === 'Full Day' ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={leaveForm.startDate}
                      onChange={e => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                      className="w-full text-sm border-slate-300 rounded-md py-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      value={leaveForm.endDate}
                      onChange={e => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                      className="w-full text-sm border-slate-300 rounded-md py-1.5"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Select Date</label>
                    <input
                      type="date"
                      required
                      value={leaveForm.startDate}
                      onChange={e => setLeaveForm({ ...leaveForm, startDate: e.target.value, endDate: e.target.value })}
                      className="w-full text-sm border-slate-300 rounded-md py-1.5"
                    />
                  </div>

                  {leaveForm.leaveType === 'Half Day' && (
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Select Session</label>
                      <div className="flex gap-2">
                        {['Morning', 'Evening'].map(type => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setLeaveForm({ ...leaveForm, halfDayType: type })}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md border transition-all ${leaveForm.halfDayType === type ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {leaveForm.leaveType === 'Hourly' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">Start Hour</label>
                          <select
                            value={leaveForm.hours[0] || ''}
                            onChange={(e) => {
                              const start = parseInt(e.target.value);
                              setLeaveForm({ ...leaveForm, hours: [start] });
                            }}
                            className="w-full text-sm border-slate-300 rounded-md py-1.5"
                          >
                            <option value="">Start</option>
                            {availableHours.map(h => (
                              <option key={h} value={h}>{formatHour(h)}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">End Hour</label>
                          <select
                            value={leaveForm.hours[leaveForm.hours.length - 1] + 1 || ''}
                            onChange={(e) => {
                              const end = parseInt(e.target.value);
                              const start = leaveForm.hours[0];
                              if (start && end > start) {
                                const range = [];
                                for (let i = start; i < end; i++) {
                                  if (availableHours.includes(i)) range.push(i);
                                }
                                setLeaveForm({ ...leaveForm, hours: range });
                              }
                            }}
                            className="w-full text-sm border-slate-300 rounded-md py-1.5"
                          >
                            <option value="">End</option>
                            {[...availableHours, 17].filter(h => h > (leaveForm.hours[0] || 0)).map(h => (
                              <option key={h} value={h}>{formatHour(h)}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 italic">
                        Selected: {leaveForm.hours.length > 0 ? leaveForm.hours.map(formatHour).join(', ') : 'None'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Reason</label>
                <textarea
                  required
                  value={leaveForm.reason}
                  onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full text-sm border-slate-300 rounded-md py-1.5"
                  rows="2"
                ></textarea>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-2 rounded-md text-sm font-medium hover:bg-slate-800">
                Submit Request
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Recent Requests</p>
              {leaveRequests.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No leave history.</p>
              ) : (
                leaveRequests.slice(0, 3).map(req => (
                  <div key={req._id} className="flex justify-between items-start text-sm border-b border-slate-50 pb-2">
                    <div>
                      <div className="font-medium text-slate-800">{req.leaveType} {req.halfDayType ? `(${req.halfDayType})` : ''}</div>
                      <div className="text-xs text-slate-500">
                        {new Date(req.startDate).toLocaleDateString()}
                        {req.startDate !== req.endDate && ` - ${new Date(req.endDate).toLocaleDateString()}`}
                      </div>
                    </div>
                    <div className={`px-2 py-0.5 rounded text-xs font-medium ${req.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                      req.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                      {req.status}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Today's Schedule
          </h2>

          {todaySchedule.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-8 border-2 border-dashed border-slate-50 rounded-xl">
              <Clock className="w-8 h-8 opacity-20 mb-2" />
              <p className="text-sm italic">No sessions scheduled for today.</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2">
              {todaySchedule.map((session, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-indigo-200 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-tight">{session.startTime} - {session.endTime}</span>
                    <BookOpen className="w-3 h-3 text-slate-300" />
                  </div>
                  <div className="text-sm font-bold text-slate-800 line-clamp-1">{session.topic}</div>
                  <div className="text-[10px] text-slate-500 font-medium">{session.courseTitle}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Assigned Courses
              </h2>
              <Link to="/dashboard/instructor/courses" className="text-sm text-indigo-600 font-medium hover:text-indigo-800">
                View All Courses
              </Link>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Manage your course content, upload materials, and track student progress.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/dashboard/instructor/courses" className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 hover:shadow-md transition-shadow flex items-center gap-3 group">
                <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 text-indigo-700">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Course Content</h3>
                  <p className="text-xs text-indigo-600 font-medium">Upload & Manage</p>
                </div>
              </Link>
              <Link to="/dashboard/instructor/courses" className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 hover:shadow-md transition-shadow flex items-center gap-3 group">
                <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 text-emerald-700">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Student List</h3>
                  <p className="text-xs text-emerald-600 font-medium">View Enrolled Students</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
        <NotificationPanel />
      </div>

    </div>
  );
};

export default InstructorDashboard;
