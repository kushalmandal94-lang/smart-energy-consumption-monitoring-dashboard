import React, { useState, useEffect } from 'react';
import {
  Gauge,
  Radio,
  Zap,
  Activity,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

const RealtimeGauge = ({ currentKW = 14.5, peakKW = 22.8, livePulse, onToggleLive, isLiveActive }) => {
  // Max scale limit (e.g., 30 kW)
  const maxScaleKW = 30;
  const loadPercentage = Math.min(100, Math.round((currentKW / maxScaleKW) * 100));

  // Determine load status color
  let statusColor = 'text-emerald-400';
  let barGradient = 'from-emerald-500 via-teal-400 to-emerald-400';
  let statusText = 'Optimal Load';

  if (loadPercentage > 80) {
    statusColor = 'text-rose-400';
    barGradient = 'from-amber-500 via-rose-500 to-rose-600';
    statusText = 'Peak Surge Alert';
  } else if (loadPercentage > 60) {
    statusColor = 'text-amber-400';
    barGradient = 'from-emerald-500 via-amber-400 to-amber-500';
    statusText = 'Moderate High Demand';
  }

  return (
    <div className="energy-card p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Real-Time Instantaneous Demand
            </h3>
            <p className="text-xs text-slate-400">Smart Meter CT Telemetry</p>
          </div>
        </div>

        {/* Live Streaming Toggle */}
        <button
          onClick={onToggleLive}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition duration-150 ${
            isLiveActive
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-sm shadow-emerald-500/20'
              : 'bg-dark-850 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isLiveActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
            }`}
          />
          <span>{isLiveActive ? 'Live Sync Active' : 'Polling Paused'}</span>
        </button>
      </div>

      {/* Main Meter Readout */}
      <div className="py-6 flex flex-col items-center justify-center text-center">
        <div className="relative flex items-center justify-center">
          <div className="w-48 h-48 rounded-full border-8 border-slate-800 flex flex-col items-center justify-center relative overflow-hidden bg-dark-950/60 shadow-inner">
            {/* Background Ring highlight */}
            <div
              className="absolute inset-0 rounded-full opacity-20 bg-gradient-to-tr from-emerald-500 to-cyan-500"
              style={{ clipPath: `inset(${100 - loadPercentage}% 0 0 0)` }}
            />
            <Zap className={`w-6 h-6 mb-1 ${statusColor}`} />
            <div className="text-4xl font-extrabold text-white font-mono tracking-tight">
              {currentKW.toFixed(2)}
            </div>
            <div className="text-xs font-bold text-slate-400 tracking-wider">
              KILOWATTS (kW)
            </div>
            <div className={`mt-1 text-[11px] font-semibold ${statusColor}`}>
              {loadPercentage}% Capacity
            </div>
          </div>
        </div>

        {/* Load Status Badge */}
        <div className="mt-4 flex items-center space-x-2 text-xs font-medium">
          <span className="text-slate-400">System Operating Status:</span>
          <span className={`px-2 py-0.5 rounded-md bg-dark-850 border border-slate-800 font-semibold ${statusColor}`}>
            {statusText}
          </span>
        </div>
      </div>

      {/* Live Electrical Parameter Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-slate-800 text-center">
        <div className="bg-dark-950/80 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-[10px] uppercase font-semibold text-slate-500 block">
            Grid Voltage
          </span>
          <span className="font-mono text-sm font-bold text-slate-200">
            {livePulse?.voltage || 230.8} V
          </span>
        </div>

        <div className="bg-dark-950/80 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-[10px] uppercase font-semibold text-slate-500 block">
            Phase Current
          </span>
          <span className="font-mono text-sm font-bold text-slate-200">
            {livePulse?.currentAmps || (currentKW * 4.3).toFixed(1)} A
          </span>
        </div>

        <div className="bg-dark-950/80 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-[10px] uppercase font-semibold text-slate-500 block">
            Power Factor (cos φ)
          </span>
          <span className="font-mono text-sm font-bold text-emerald-400">
            {livePulse?.powerFactor || 0.96}
          </span>
        </div>

        <div className="bg-dark-950/80 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-[10px] uppercase font-semibold text-slate-500 block">
            Today Peak Demand
          </span>
          <span className="font-mono text-sm font-bold text-amber-400">
            {peakKW} kW
          </span>
        </div>
      </div>
    </div>
  );
};

export default RealtimeGauge;

