import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Zap, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

const LoginPage = ({ onSwitchToRegister }) => {
  const { login, loginAsDemo, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }
    setLocalError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setLocalError(result.message || 'Login failed.');
    }
  };

  const handleDemoLogin = async () => {
    setLocalError('');
    setLoading(true);
    await loginAsDemo();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#060913] flex items-center justify-center p-4 relative overflow-hidden selection:bg-emerald-500 selection:text-black">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-dark-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 items-center justify-center shadow-lg shadow-emerald-500/25 mb-3">
            <Zap className="w-7 h-7 text-dark-950 font-bold" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            VoltPulse
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Smart Energy Consumption Monitoring System
          </p>
        </div>

        {/* Demo Fast Login Banner */}
        <div className="mb-6 p-3.5 bg-gradient-to-r from-emerald-950/40 via-dark-850 to-dark-950 rounded-2xl border border-emerald-500/30 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Instant Live Exploration</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 mb-2.5">
            Test the full dashboard instantly with pre-configured telemetry without typing credentials.
          </p>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-dark-950 font-bold rounded-xl flex items-center justify-center space-x-1.5 transition shadow-md shadow-emerald-500/20"
          >
            <span>{loading ? 'Initializing...' : '1-Click Demo Login'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="relative my-6 text-center">
          <hr className="border-slate-800" />
          <span className="bg-dark-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider absolute -top-2 left-1/2 -translate-x-1/2">
            Or sign in with email
          </span>
        </div>

        {/* Error Alert */}
        {(localError || authError) && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
            {localError || authError}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-dark-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-dark-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-dark-950 font-bold rounded-xl transition shadow-lg shadow-emerald-500/20 text-xs"
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        {/* Switch to Register */}
        <div className="mt-6 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-emerald-400 hover:underline font-semibold"
          >
            Register new account
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

