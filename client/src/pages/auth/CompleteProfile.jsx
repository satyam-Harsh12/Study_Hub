import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/axiosInstance.js';
import { useAuth } from '../../context/AuthContext.jsx';

const CompleteProfile = () => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, login, token, getDefaultDashboard } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/complete-profile', { email, phone });
      
      // Update local user state
      const updatedUser = { ...user, needsProfileCompletion: false, email, phone };
      login(updatedUser, token);

      // Redirect properly
      navigate(getDefaultDashboard(updatedUser), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/complete-profile', { skip: true });
      
      const updatedUser = { ...user, needsProfileCompletion: false };
      login(updatedUser, token);

      navigate(getDefaultDashboard(updatedUser), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to skip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-950 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-xl shadow-sky-900/40">
        <h2 className="text-2xl font-bold text-white mb-2">Complete Profile</h2>
        <p className="text-sm text-slate-400 mb-6">Please provide your contact details to continue.</p>
        
        {error && <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-200">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-400">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400">Mobile Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full px-3 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-md mt-4"
          >
            {loading ? 'Saving...' : 'Complete Profile'}
          </button>
          
          <button
            type="button"
            onClick={handleSkip}
            disabled={loading}
            className="w-full py-3 bg-transparent text-slate-400 hover:text-white transition-colors text-sm font-medium rounded-xl"
          >
            Skip for now
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
