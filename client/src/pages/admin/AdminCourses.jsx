import React, { useEffect, useState } from 'react';
import {
  createAdminCourse,
  getAdminCourses,
  getAdminInstructors,
  updateAdminCourse,
  deleteAdminCourse,
  toggleCourseStatus
} from '../../api/adminApi.js';
import { Edit2, Plus, X, Trash2, Eye, EyeOff } from 'lucide-react';

import { useAuth } from '../../context/AuthContext.jsx';

const AdminCourses = () => {
  const { user } = useAuth();

  const isSuperAdmin = user?.role === 'super_admin';
  const permissions = user?.permissions || [];

  const canCreate = isSuperAdmin || permissions.some(p => p.name === 'course.create');
  const canEdit = isSuperAdmin || permissions.some(p => p.name === 'course.edit');
  const canDelete = isSuperAdmin || permissions.some(p => p.name === 'course.delete');

  // ... rest of the component

  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    instructorId: '',
    startDate: '',
    endDate: ''
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [courseRes, instructorRes] = await Promise.all([
        getAdminCourses(),
        getAdminInstructors()
      ]);
      setCourses(courseRes.data || []);
      setInstructors(instructorRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditClick = (course) => {
    setIsEditing(true);
    setEditId(course._id);
    setForm({
      title: course.title,
      description: course.description || '',
      category: course.category || '',
      price: course.price || 0,
      instructorId: course.instructor?._id || '',
      startDate: course.startDate ? new Date(course.startDate).toISOString().split('T')[0] : '',
      endDate: course.endDate ? new Date(course.endDate).toISOString().split('T')[0] : ''
    });
    setSuccess('');
    setError('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditId(null);
    setForm({
      title: '',
      description: '',
      category: '',
      price: '',
      instructorId: '',
      startDate: '',
      endDate: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...form,
        price: form.price ? Number(form.price) : 0,
        instructor: form.instructorId // Backend expects 'instructor' field for ID
      };

      if (isEditing) {
        await updateAdminCourse(editId, payload);
        setSuccess(isSuperAdmin ? 'Course updated successfully.' : 'Course updates submitted for approval.');
      } else {
        await createAdminCourse(payload);
        setSuccess(isSuperAdmin ? 'Course created successfully.' : 'Course submitted for approval.');
      }

      handleCancelEdit(); // Reset form
      await load(); // Reload list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This will delete the course permanently.')) return;
    try {
      await deleteAdminCourse(id);
      if (isSuperAdmin) {
        setCourses(prev => prev.filter(c => c._id !== id));
      } else {
        load();
      }
      setSuccess(isSuperAdmin ? 'Course deleted.' : 'Deletion request submitted.');
    } catch (err) {
      alert('Failed to delete course');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await toggleCourseStatus(id);
      setCourses(prev => prev.map(c => c._id === id ? { ...c, isActive: !c.isActive } : c));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Course Management</h2>
          <p className="text-sm text-slate-500">
            Create and manage free and paid courses offered in the training center.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.2fr,1.6fr]">
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm h-fit">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                {isEditing ? 'Edit Course' : 'Add New Course'}
              </h3>
              <p className="mt-1 text-[11px] text-slate-500">
                {isEditing ? 'Update course details and re-assign instructor.' : 'Define course details and assign instructor.'}
              </p>
            </div>
            {isEditing && (
              <button
                onClick={handleCancelEdit}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-500"
                title="Cancel Edit"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {error && (
            <p className="mb-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}
          {success && (
            <p className="mb-2 rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              {success}
            </p>
          )}



          {canCreate && (
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              {/* ... inputs ... */}
              <div>
                <label className="mb-1 block font-medium text-slate-700">Title</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-medium text-slate-700">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-medium text-slate-700">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block font-medium text-slate-700">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="e.g. development"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-medium text-slate-700">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0 for free"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="bg-yellow-50 p-1 rounded border border-yellow-100">
                  <label className="mb-1 block font-bold text-slate-700">
                    Instructor
                  </label>
                  <select
                    name="instructorId"
                    value={form.instructorId}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border border-slate-300 px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">Select Lead</option>
                    {instructors.map((inst) => (
                      <option key={inst._id} value={inst._id}>
                        {inst.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className={`mt-1 w-full rounded-md py-2 text-xs font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2 ${isEditing ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-900 hover:bg-slate-800'
                  }`}
              >
                {saving ? 'Saving...' : (isEditing ? 'Update Course' : 'Create Course')}
                {!saving && !isEditing && <Plus className="w-3 h-3" />}
              </button>
            </form>
          )}
          {!canCreate && !isEditing && (
            <div className="text-center p-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
              <p>You do not have permission to create courses.</p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">All courses</h3>
          <p className="mb-2 mt-1 text-[11px] text-slate-500">
            List of all courses with pricing and instructor details. Click edit icon to re-assign.
          </p>
          {loading ? (
            <p className="text-xs text-slate-500">Loading courses...</p>
          ) : (
            <div className="max-h-[500px] overflow-auto text-xs">
              <table className="min-w-full border-separate border-spacing-y-1">
                <thead>
                  <tr className="text-left text-[11px] text-slate-500">
                    <th className="px-2 py-1">Title</th>
                    <th className="px-2 py-1">Instructor</th>
                    <th className="px-2 py-1">Type</th>
                    <th className="px-2 py-1">Price</th>
                    <th className="px-2 py-1">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr
                      key={course._id}
                      className={`rounded-lg transition hover:bg-slate-100 ${editId === course._id ? 'bg-indigo-50 border border-indigo-100' : 'bg-slate-50 shadow-sm'
                        }`}
                    >
                      <td className="px-2 py-2 text-[11px] font-medium">
                        {course.title}
                        {course.status === 'PENDING' && (
                          <span className="ml-2 bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-2 text-[11px]">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          {course.instructor?.name || <span className="text-red-500 italic">Unassigned</span>}
                        </div>
                      </td>
                      <td className="px-2 py-2 text-[11px]">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-wide ${course.isPaid
                            ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-100'
                            : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                            }`}
                        >
                          {course.isPaid ? 'Paid' : 'Free'}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-[11px]">
                        {course.isPaid ? `₹${course.price}` : '—'}
                      </td>
                      <td className="px-2 py-2 text-[11px]">
                        {canEdit && (
                          <button
                            onClick={() => handleEditClick(course)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            title="Edit Course"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canEdit && (
                          <button
                            onClick={() => handleToggleStatus(course._id)}
                            className={`p-1.5 rounded transition-colors ${course.isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-50'}`}
                            title={course.isActive ? 'Unpublish' : 'Publish'}
                          >
                            {course.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(course._id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Course"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!loading && courses.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-2 py-2 text-[11px] text-slate-500"
                      >
                        No courses found yet. Create a course using the form on the
                        left.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCourses;


