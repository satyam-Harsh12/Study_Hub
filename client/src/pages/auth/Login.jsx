import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginApi, sendOtpApi, verifyOtpApi } from '../../api/authApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Eye, EyeOff, Mail, Phone, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [method, setMethod] = useState('otp'); // 'otp' or 'password'
  const [identifier, setIdentifier] = useState(''); // Email
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Input Identifier, 2: Input OTP (for OTP method)
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mockOtpHint, setMockOtpHint] = useState(''); // For demo purposes

  const navigate = useNavigate();
  const location = useLocation();
  const { login, getDefaultDashboard } = useAuth();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await sendOtpApi({ identifier });
      // In real app, we don't return OTP. Here we do for demo.
      if (res.data.mockOtp) {
        setMockOtpHint(res.data.mockOtp);
      }
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await verifyOtpApi({ identifier, otp });
      const { user, token } = res.data;
      login(user, token);
      if (user.isFirstLogin) {
        navigate('/update-password', { replace: true });
      } else if (user.needsProfileCompletion) {
        navigate('/complete-profile', { replace: true });
      } else {
        const from = location.state?.from?.pathname || getDefaultDashboard(user);
        navigate(from, { replace: true });
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError(
          <span>
            User not found. <Link to="/register" className="underline font-bold">Create an account</Link> first.
          </span>
        );
      } else {
        setError(err.response?.data?.message || 'Invalid OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await loginApi({ email: identifier, password }); // Assuming identifier is email for password login
      const { user, token } = res.data;
      login(user, token);
      if (user.isFirstLogin) {
        navigate('/update-password', { replace: true });
      } else if (user.needsProfileCompletion) {
        navigate('/complete-profile', { replace: true });
      } else {
        const from = location.state?.from?.pathname || getDefaultDashboard(user);
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const isEmail = identifier.includes('@');

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-950 px-4 py-8 relative overflow-hidden">
      {/* Animated Background Blob */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse"></div>

      <div className="grid w-full max-w-4xl gap-8 rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-2xl md:grid-cols-[1fr,1.2fr] md:p-8 relative z-10">

        {/* Left Side: Branding */}
        <div className="hidden flex-col justify-between rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white md:flex relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="w-8 h-8 text-indigo-200" />
              <span className="font-bold text-lg tracking-wide">EduGuard</span>
            </div>
            <h2 className="text-3xl font-bold leading-tight mb-4">
              Secure & Seamless Access
            </h2>
            <p className="text-indigo-100 text-sm leading-relaxed">
              Log in to access your courses, track your progress, and connect with mentors. Now supporting fast and secure OTP login via Email.
            </p>
          </div>

          <div className="relative z-10 mt-8">
            <div className="flex -space-x-2 overflow-hidden mb-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-indigo-500 bg-indigo-400"></div>
              ))}
            </div>
            <p className="text-xs text-indigo-200 font-medium">Join 10,000+ happy learners today.</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full max-w-md justify-self-center py-4">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-slate-400 text-sm">Please enter your details to sign in</p>
          </div>

          {/* Toggle Switch */}
          <div className="flex bg-slate-800/50 p-1 rounded-xl mb-8 border border-slate-700/50 relative">
            <div className={`absolute top-1 bottom-1 w-1/2 bg-slate-700 rounded-lg transition-all duration-300 ${method === 'otp' ? 'left-1' : 'left-[calc(50%-4px)] translate-x-1'}`}></div>
            <button
              onClick={() => { setMethod('otp'); setStep(1); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium z-10 relative transition-colors ${method === 'otp' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
            >
              OTP Login
            </button>
            <button
              onClick={() => { setMethod('password'); setStep(1); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium z-10 relative transition-colors ${method === 'password' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Password
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-200 text-center animate-shake">
              {error}
            </div>
          )}

          {mockOtpHint && (
            <div className="mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-200 text-center">
              <span className="opacity-70">Demo OTP:</span> <span className="font-bold tracking-widest">{mockOtpHint}</span>
            </div>
          )}

          <form onSubmit={method === 'otp' ? (step === 1 ? handleSendOtp : handleVerifyOtp) : handlePasswordLogin} className="space-y-5">

            {/* Identifier Input */}
            {(step === 1 || method === 'password') && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400 ml-1">Email or User ID</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="name@example.com or 1001"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Password Input */}
            {method === 'password' && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400 ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-10 pr-10 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {/* OTP Input */}
            {method === 'otp' && step === 2 && (
              <div className="space-y-1 animate-fade-in-up">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-slate-400 ml-1">Enter Verification Code</label>
                  <button type="button" onClick={() => setStep(1)} className="text-xs text-indigo-400 hover:underline">Change Email</button>
                </div>
                <input
                  type="text"
                  placeholder="X X X X X X"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                  className="block w-full text-center tracking-[0.5em] text-2xl font-bold py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
                <p className="text-center text-xs text-slate-500 mt-2">
                  Didn't receive code? <button type="button" onClick={handleSendOtp} className="text-indigo-400 hover:text-indigo-300 font-medium">Resend</button>
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  {method === 'otp' ? (step === 1 ? 'Send OTP Code' : 'Verify & Login') : 'Log In'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-xs">
              Don't have an account yet?{' '}
              <Link to="/register" className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors">
                Create Free Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;


