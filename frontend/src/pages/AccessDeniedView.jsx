import React from 'react';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AccessDeniedView = ({ attemptedTab, onGoHome }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-dark-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 items-center justify-center mb-4">
          <ShieldAlert className="w-7 h-7 text-rose-400" />
        </div>

        <h1 className="text-xl font-black text-white tracking-tight">
          Access Restricted by RBAC Policy
        </h1>

        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          The requested section <strong className="text-slate-200">'{attemptedTab}'</strong> is not authorized for your current role profile:
        </p>

        <div className="my-4 p-3 bg-dark-950 rounded-2xl border border-slate-800/80 text-xs">
          <div className="font-bold text-white">{user?.name}</div>
          <div className="text-emerald-400 capitalize mt-0.5 font-semibold">
            Role: {user?.role || 'Guest'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Assigned Scope: {(user?.assignedBuildings || ['Main Facility']).join(', ')}
          </div>
        </div>

        <p className="text-[11px] text-slate-500 mb-6">
          System administrators can modify permissions and assign additional building scopes in the User Management console.
        </p>

        <button
          onClick={onGoHome}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-dark-950 font-bold rounded-xl transition shadow-lg shadow-emerald-500/20 text-xs flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Authorized Dashboard</span>
        </button>
      </div>
    </div>
  );
};

export default AccessDeniedView;

