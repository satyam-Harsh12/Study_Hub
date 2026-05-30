import React, { useEffect, useState } from 'react';
import {
  createAdminInstructor,
  getAdminInstructors,
  deleteUser,
  toggleUserStatus
} from '../../api/adminApi.js';
import { Trash2, Shield, ShieldOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const AdminInstructors = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAdminInstructors();
      setInstructors(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load instructors');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await createAdminInstructor(form);
      setSuccess(isSuperAdmin ? 'Instructor created successfully.' : 'Hiring request submitted for approval.');
      setForm({ name: '', email: '', password: '' });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create instructor');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This will delete the instructor account.')) return;
    try {
      await deleteUser(id);
      if (isSuperAdmin) {
        setInstructors(prev => prev.filter(i => i._id !== id));
      } else {
        load();
      }
      setSuccess(isSuperAdmin ? 'Instructor deleted.' : 'Removal request submitted.');
    } catch (err) {
      alert('Failed to delete instructor');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await toggleUserStatus(id);
      setInstructors(prev => prev.map(i => i._id === id ? { ...i, isActive: res.data.isActive } : i));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Instructor Management
          </h2>
          <p className="text-sm text-slate-500">
            Add new instructors and view existing profiles.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.1fr,1.4fr]">
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">
            Add new instructor
          </h3>
          <p className="mb-3 mt-1 text-[11px] text-slate-500">
            Create an instructor account with login credentials.
          </p>

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

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="mb-1 block font-medium text-slate-700">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block font-medium text-slate-700">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block font-medium text-slate-700">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-1 w-full rounded-md bg-slate-900 py-2 text-xs font-medium text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Creating...' : 'Create instructor'}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">
            Existing instructors
          </h3>
          <p className="mb-2 mt-1 text-[11px] text-slate-500">
            Overview of registered instructors and their account status.
          </p>
          {loading ? (
            <p className="text-xs text-slate-500">Loading instructors...</p>
          ) : (
            <div className="max-h-72 overflow-auto text-xs">
              <table className="min-w-full border-separate border-spacing-y-1">
                <thead>
                  <tr className="text-left text-[11px] text-slate-500">
                    <th className="px-2 py-1">Name</th>
                    <th className="px-2 py-1">Email</th>
                    <th className="px-2 py-1">Status</th>
                    <th className="px-2 py-1">Created</th>
                    <th className="px-2 py-1 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {instructors.map((inst) => (
                    <tr
                      key={inst._id}
                      className="animate-[fadeIn_0.2s_ease-out] rounded-lg bg-slate-50 text-slate-700 shadow-sm"
                    >
                      <td className="px-2 py-2 text-[11px] font-medium">
                        {inst.name}
                      </td>
                      <td className="px-2 py-2 text-[11px]">{inst.email}</td>
                      <td className="px-2 py-2 text-[11px]">
                        {inst.status === 'PENDING' ? (
                          <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full uppercase font-bold text-[10px]">Pending</span>
                        ) : (
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-wide ${inst.isActive
                              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                              : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
                              }`}
                          >
                            {inst.isActive ? 'Active' : 'Inactive'}
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-2 text-[11px] text-slate-500">
                        {inst.createdAt
                          ? new Date(inst.createdAt).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="px-2 py-2 text-right">
                        <div className="flex justify-end gap-2 items-center">
                          <button
                            onClick={() => handleToggleStatus(inst._id)}
                            className={`p-1.5 rounded-md transition ${inst.isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}
                            title={inst.isActive ? 'Deactivate Account' : 'Activate Account'}
                          >
                            {inst.isActive ? <Shield className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDelete(inst._id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition"
                            title="Delete Instructor"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && instructors.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-2 py-2 text-[11px] text-slate-500"
                      >
                        No instructors found yet. Create your first instructor using the
                        form on the left.
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

export default AdminInstructors;


