import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerApi } from '../../api/authApi.js';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await registerApi(form);
      setSuccess('Registration successful. You can now login.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-950 px-4 py-8">
      <div className="grid w-full max-w-5xl gap-8 rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-xl shadow-sky-900/40 md:grid-cols-[1.1fr,1fr] md:p-8">
        <div className="hidden flex-col justify-between rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 p-6 ring-1 ring-slate-800 md:flex">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-sky-300">
              Onboard quickly
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Create your training account.
            </h2>
            <p className="mt-2 text-xs text-slate-300">
              Sign up as a student, instructor, or admin to access the complete training
              management experience with demo-safe payments.
            </p>
          </div>
          <div className="mt-6 grid gap-3 text-xs text-slate-200">
            <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                Role options
              </p>
              <p className="mt-1 text-[11px] text-slate-300">
                • <span className="font-semibold text-emerald-300">Student</span> —
                browse, enroll, and attempt assessments.
              </p>
              <p className="text-[11px] text-slate-300">
                • <span className="font-semibold text-sky-300">Instructor</span> —
                create courses, schedules, and evaluate learners.
              </p>
              <p className="text-[11px] text-slate-300">
                • <span className="font-semibold text-amber-300">Admin</span> —
                oversee the entire training center.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md justify-self-center rounded-xl bg-slate-50 p-6 shadow-sm md:bg-white md:shadow-none">
          <h1 className="mb-1 text-xl font-semibold text-slate-900">
            Create an account
          </h1>
          <p className="mb-4 text-sm text-slate-500">
            Join as a student, instructor, or admin.
          </p>

          {error && (
            <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-slate-900 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

          <p className="mt-4 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary-dark"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;


