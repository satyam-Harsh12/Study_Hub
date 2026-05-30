import React, { useEffect, useState } from 'react';
import { getAdminStudents, deleteUser, toggleUserStatus } from '../../api/adminApi.js';
import { Trash2, Shield, ShieldOff, MoreHorizontal } from 'lucide-react';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAdminStudents();
        setStudents(res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load students');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) return;
    try {
      await deleteUser(id);
      setStudents(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      alert('Failed to delete student');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await toggleUserStatus(id);
      setStudents(prev => prev.map(s => s._id === id ? { ...s, isActive: res.data.isActive } : s));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Student Management</h2>
          <p className="text-sm text-slate-500">
            View real-time student details, enrollments, and progress.
          </p>
        </div>
      </div>

      {error && (
        <p className="mb-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Registered students</h3>
        <p className="mb-2 mt-1 text-[11px] text-slate-500">
          Includes basic info, enrolled courses, and a quick progress view.
        </p>
        {loading ? (
          <p className="text-xs text-slate-500">Loading students...</p>
        ) : (
          <div className="max-h-[420px] overflow-auto text-xs">
            <table className="min-w-full border-separate border-spacing-y-1">
              <thead>
                <tr className="text-left text-[11px] text-slate-500">
                  <th className="px-2 py-1">Name</th>
                  <th className="px-2 py-1">Email</th>
                  <th className="px-2 py-1">Enrollments</th>
                  <th className="px-2 py-1">Status</th>
                  <th className="px-2 py-1">Created</th>
                  <th className="px-2 py-1 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((stu) => {
                  const enrollmentCount = stu.enrollments?.length || 0;
                  return (
                    <React.Fragment key={stu._id}>
                      <tr className="rounded-lg bg-slate-50 text-slate-700 shadow-sm transition hover:bg-slate-100">
                        <td className="px-2 py-2 text-[11px] font-medium">
                          {stu.name}
                        </td>
                        <td className="px-2 py-2 text-[11px]">{stu.email}</td>
                        <td className="px-2 py-2 text-[11px]">
                          {enrollmentCount} course{enrollmentCount !== 1 ? 's' : ''}
                        </td>
                        <td className="px-2 py-2 text-[11px]">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-wide ${stu.isActive
                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                                : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
                              }`}
                          >
                            {stu.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-[11px] text-slate-500">
                          {stu.createdAt
                            ? new Date(stu.createdAt).toLocaleDateString()
                            : '-'}
                        </td>
                        <td className="px-2 py-2 text-right text-[11px]">
                          <div className="flex justify-end gap-2 items-center">
                            <button
                              type="button"
                              onClick={() => toggleExpand(stu._id)}
                              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2"
                            >
                              {expandedId === stu._id ? 'Hide ' : 'Details'}
                            </button>

                            <button
                              onClick={() => handleToggleStatus(stu._id)}
                              className={`p-1.5 rounded-md transition ${stu.isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}
                              title={stu.isActive ? 'Deactivate Account' : 'Activate Account'}
                            >
                              {stu.isActive ? <Shield className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => handleDelete(stu._id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition"
                              title="Delete Student"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedId === stu._id && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-2 pb-3 pt-1 text-[11px] text-slate-600"
                          >
                            <div className="animate-[fadeIn_0.2s_ease-out] rounded-xl border border-slate-200 bg-white px-3 py-3">
                              <p className="mb-2 text-[11px] font-semibold text-slate-800">
                                Course-wise progress
                              </p>
                              {enrollmentCount === 0 ? (
                                <p className="text-[11px] text-slate-500">
                                  This student is not enrolled in any courses yet.
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {stu.enrollments.map((enr) => (
                                    <div
                                      key={`${stu._id}-${enr.courseId || enr.courseTitle}`}
                                      className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="text-[11px] font-semibold text-slate-800">
                                            {enr.courseTitle}
                                          </p>
                                          <p className="text-[10px] text-slate-500">
                                            Status:{' '}
                                            <span className="capitalize">
                                              {enr.status}
                                            </span>
                                          </p>
                                        </div>
                                        <p className="text-[11px] text-slate-700">
                                          {enr.progress}% complete
                                        </p>
                                      </div>
                                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                                        <div
                                          className="h-full rounded-full bg-sky-500"
                                          style={{
                                            width: `${Math.min(
                                              100,
                                              Math.max(0, enr.progress || 0)
                                            )}%`
                                          }}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
                {!loading && students.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-2 py-2 text-[11px] text-slate-500">
                      No students registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStudents;


