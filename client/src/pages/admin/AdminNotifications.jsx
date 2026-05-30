import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  Users,
  BookOpen,
  Calendar,
  Trash2,
  Info,
  CheckCircle2,
  AlertCircle,
  Plus,
  X
} from 'lucide-react';
import { getAdminAnnouncements, createAnnouncement, deleteAnnouncement, getAdminCourses } from '../../api/adminApi';

const AdminNotifications = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetType: 'all',
    targetRole: 'student',
    targetCourse: '',
    scheduledDate: new Date().toISOString().split('T')[0]
  });

  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [annRes, courseRes] = await Promise.all([
        getAdminAnnouncements(),
        getAdminCourses()
      ]);
      setAnnouncements(annRes.data);
      setCourses(courseRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createAnnouncement(formData);
      setMessage({ type: 'success', text: 'Announcement created successfully!' });
      setFormData({
        title: '',
        message: '',
        targetType: 'all',
        targetRole: 'student',
        targetCourse: '',
        scheduledDate: new Date().toISOString().split('T')[0]
      });
      setShowForm(false);
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create announcement.' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await deleteAnnouncement(id);
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const getTargetLabel = (ann) => {
    if (ann.targetType === 'all') return 'All Users';
    if (ann.targetType === 'role') return `Role: ${ann.targetRole}`;
    if (ann.targetType === 'course') return `Course: ${ann.targetCourse?.title || 'Unknown'}`;
    return 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notifications & Announcements</h1>
          <p className="text-slate-500 text-sm">Broadcast updates and schedule future notifications.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all shadow-sm ${showForm ? 'bg-slate-100 text-slate-600' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
            }`}
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Cancel' : 'New Announcement'}
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
          }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-100/50 animate-in zoom-in-95 duration-300">
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6 lg:col-span-1">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Announcement Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Holiday Notice or Final Exam Schedule"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Message Content</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Type your message here..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-6 lg:col-span-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Target Audience</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                    value={formData.targetType}
                    onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
                  >
                    <option value="all">Everyone</option>
                    <option value="role">Specific Role</option>
                    <option value="course">Specific Course</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Schedule Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  />
                </div>
              </div>

              {formData.targetType === 'role' && (
                <div className="animate-in fade-in slide-in-from-left-2 transition-all">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Select Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['student', 'instructor'].map(role => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setFormData({ ...formData, targetRole: role })}
                        className={`px-4 py-3 rounded-xl border font-medium capitalize transition-all ${formData.targetRole === role
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                          }`}
                      >
                        {role}s
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {formData.targetType === 'course' && (
                <div className="animate-in fade-in slide-in-from-left-2 transition-all">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Select Course</label>
                  <select
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                    value={formData.targetCourse}
                    onChange={(e) => setFormData({ ...formData, targetCourse: e.target.value })}
                  >
                    <option value="">Choose a course...</option>
                    {courses.map(c => (
                      <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2 group"
                >
                  <Send className={`w-5 h-5 transition-transform ${submitting ? 'translate-x-10 opacity-0' : 'group-hover:translate-x-1'}`} />
                  {submitting ? 'Sending...' : 'Publish Announcement'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Announcements List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            Announcement History
          </h3>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{announcements.length} Sent</span>
        </div>
        <div className="divide-y divide-slate-100">
          {announcements.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Info className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No announcements found.</p>
            </div>
          ) : (
            announcements.map((ann) => (
              <div key={ann._id} className="p-6 hover:bg-slate-50/50 transition-colors group">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-slate-800">{ann.title}</h4>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${ann.targetType === 'all' ? 'bg-indigo-100 text-indigo-700' :
                          ann.targetType === 'role' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                        {getTargetLabel(ann)}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed max-w-2xl">{ann.message}</p>
                    <div className="flex items-center gap-4 pt-2">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        Scheduled: {new Date(ann.scheduledDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Users className="w-3.5 h-3.5" />
                        Created: {new Date(ann.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(ann._id)}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
