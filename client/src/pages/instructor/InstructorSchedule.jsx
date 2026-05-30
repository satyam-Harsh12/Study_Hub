import React, { useEffect, useState } from 'react';
import { getMyCoursesApi, addLectureSessionApi } from '../../api/courseApi.js';
import { Calendar as CalendarIcon, Clock, BookOpen, MapPin, AlignJustify, Link as LinkIcon, Plus, X } from 'lucide-react';

const InstructorSchedule = () => {
  const [courses, setCourses] = useState([]);
  const [allSessions, setAllSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('week'); // 'today', 'week', 'all'

  // Add Session Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSession, setNewSession] = useState({
    courseId: '',
    topic: '',
    date: '',
    startTime: '',
    endTime: '',
    link: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    setLoading(true);
    try {
      const res = await getMyCoursesApi();
      const coursesData = res.data || [];
      setCourses(coursesData);

      // Flatten all schedule entries from all courses
      const sessions = [];
      coursesData.forEach(course => {
        if (course.schedule && Array.isArray(course.schedule)) {
          course.schedule.forEach(slot => {
            sessions.push({
              ...slot,
              courseId: course._id,
              mainInstructorId: course.instructor?._id,
              courseTitle: course.title,
              category: course.category
            });
          });
        }
      });

      // Sort by date and time
      sessions.sort((a, b) => new Date(a.date) - new Date(b.date));
      setAllSessions(sessions);
    } catch (err) {
      console.error('Error loading schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSession = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addLectureSessionApi(newSession.courseId, {
        topic: newSession.topic,
        date: newSession.date,
        startTime: newSession.startTime,
        endTime: newSession.endTime,
        link: newSession.link
      });
      alert('Session scheduled successfully!');
      setShowAddModal(false);
      setNewSession({ courseId: '', topic: '', date: '', startTime: '', endTime: '', link: '' });
      loadSchedule();
    } catch (err) {
      console.error(err);
      alert('Failed to schedule session.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSessions = allSessions.filter(session => {
    const sessionDate = new Date(session.date);
    sessionDate.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (filter === 'today') return sessionDate.getTime() === now.getTime();

    if (filter === 'week') {
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() + 7);
      return sessionDate >= now && sessionDate <= weekEnd;
    }

    return true;
  });

  const getStatusColor = (dateString, link) => {
    const sessionDate = new Date(dateString);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (sessionDate.toDateString() === now.toDateString()) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (sessionDate < now) return 'bg-slate-100 text-slate-500 border-slate-200';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Whole Class Timetable</h1>
          <p className="text-sm text-slate-500">View and manage your teaching schedule.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            New Session
          </button>
          <div className="flex bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setFilter('today')}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${filter === 'today' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Today
            </button>
            <button
              onClick={() => setFilter('week')}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${filter === 'week' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Week View
            </button>
          </div>
        </div>
      </div>

      {/* Add Session Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Schedule New Lecture</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-200 rounded-full">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleAddSession} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Select Course</label>
                <select
                  required
                  className="w-full border-slate-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  value={newSession.courseId}
                  onChange={e => setNewSession({ ...newSession, courseId: e.target.value })}
                >
                  <option value="">-- Choose a Course --</option>
                  {courses.map(c => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Topic / Title</label>
                <input
                  type="text"
                  required
                  className="w-full border-slate-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g. Advanced React Patterns"
                  value={newSession.topic}
                  onChange={e => setNewSession({ ...newSession, topic: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    className="w-full border-slate-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    value={newSession.date}
                    onChange={e => setNewSession({ ...newSession, date: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Start</label>
                    <input
                      type="time"
                      required
                      className="w-full border-slate-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={newSession.startTime}
                      onChange={e => setNewSession({ ...newSession, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">End</label>
                    <input
                      type="time"
                      required
                      className="w-full border-slate-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={newSession.endTime}
                      onChange={e => setNewSession({ ...newSession, endTime: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Meeting Link (Zoom/Meet)</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    className="w-full pl-9 border-slate-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://meet.google.com/..."
                    value={newSession.link}
                    onChange={e => setNewSession({ ...newSession, link: e.target.value })}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Optional. Students can click this to join directly.</p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Scheduling...' : 'Schedule Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {filteredSessions.length === 0 ? (
        <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center">
          <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <CalendarIcon className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-slate-900 font-semibold italic">No sessions found</h3>
          <p className="text-slate-500 text-sm mt-1">Try changing your filters or add a new session.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(
            filteredSessions.reduce((acc, session) => {
              const dateKey = new Date(session.date).toDateString();
              if (!acc[dateKey]) acc[dateKey] = [];
              acc[dateKey].push(session);
              return acc;
            }, {})
          ).map(([date, sessions]) => (
            <div key={date} className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                  {new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </div>
                <div className="h-px flex-1 bg-slate-200"></div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {sessions.map((session, index) => (
                  <div key={index} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getStatusColor(session.date).split(' ')[0]}`}></div>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(session.date)}`}>
                            {new Date(session.date).toDateString() === new Date().toDateString() ? 'Today' :
                              new Date(session.date) < new Date() ? 'Completed' : 'Upcoming'}
                          </span>
                          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {session.category}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors flex items-center gap-2">
                          {session.topic}
                          {session.link && (
                            <a
                              href={session.link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] rounded-full border border-indigo-100 hover:bg-indigo-100"
                            >
                              <LinkIcon className="w-3 h-3" /> Join Meeting
                            </a>
                          )}
                        </h3>

                        <div className="text-sm font-medium text-indigo-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {session.courseTitle}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 lg:text-right">
                        <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <div className="text-sm">
                            <div className="font-bold text-slate-900">{session.startTime} - {session.endTime}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorSchedule;
