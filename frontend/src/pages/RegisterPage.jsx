import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Zap, Lock, Mail, User, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

const RegisterPage = ({ onSwitchToLogin }) => {
  const { register, error: authError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('manager');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleQuickFill = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setName('Jordan Hayes');
    setEmail(`jordan.hayes${randomSuffix}@facility.com`);
    setPassword('EnergyPass2026!');
    setRole('manager');
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setLocalError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }
    setLocalError('');
    setLoading(true);
    const result = await register(name, email, password, role);
    setLoading(false);
    if (!result.success) {
      setLocalError(result.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#060913] flex items-center justify-center p-4 relative overflow-hidden selection:bg-emerald-500 selection:text-black">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-dark-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 items-center justify-center shadow-lg shadow-emerald-500/25 mb-3">
            <Zap className="w-7 h-7 text-dark-950 font-bold" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Create Account
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Register for VoltPulse Smart Energy Monitoring
          </p>
        </div>

        {/* Quick Demo Pre-fill Pill */}
        <div className="mb-5 p-3 bg-dark-950/80 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] text-slate-400">Want to test quickly?</span>
          </div>
          <button
            type="button"
            onClick={handleQuickFill}
            className="px-2.5 py-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg border border-emerald-500/20 transition"
          >
            Auto-fill form
          </button>
        </div>

        {(localError || authError) && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-start space-x-2">
            <span>•</span>
            <span>{localError || authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jordan Hayes"
                className="w-full bg-dark-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jordan.hayes@facility.com"
                className="w-full bg-dark-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-dark-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              User Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="manager">Facility Manager</option>
              <option value="admin">System Administrator</option>
              <option value="operator">Energy Auditor / Operator</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-dark-950 font-bold rounded-xl transition shadow-lg shadow-emerald-500/20 text-xs flex items-center justify-center space-x-1.5"
          >
            <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
            {!loading && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-emerald-400 hover:underline font-semibold"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

