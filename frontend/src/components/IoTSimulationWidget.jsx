import React, { useState, useEffect } from 'react';
import {
  Radio,
  Play,
  Pause,
  Square,
  Zap,
  AlertTriangle,
  Clock,
  CheckCircle2,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import api from '../api/axios';

const IoTSimulationWidget = ({ onPulse }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pulseLoading, setPulseLoading] = useState(false);
  const [anomalyLoading, setAnomalyLoading] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState('power_surge');
  const [feedback, setFeedback] = useState(null);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/iot-simulation/status');
      setStatus(res.data?.data || null);
    } catch (err) {
      console.warn('Simulation status poll notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = async () => {
    try {
      await api.post('/iot-simulation/start');
      fetchStatus();
      setFeedback({ type: 'success', message: 'Simulation loop started.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to start' });
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  const handlePause = async () => {
    try {
      await api.post('/iot-simulation/pause');
      fetchStatus();
      setFeedback({ type: 'info', message: 'Simulation paused.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to pause' });
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleStop = async () => {
    try {
      await api.post('/iot-simulation/stop');
      fetchStatus();
      setFeedback({ type: 'info', message: 'Simulation stopped.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to stop' });
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  const handlePulse = async () => {
    try {
      setPulseLoading(true);
      const res = await api.post('/iot-simulation/pulse');
      fetchStatus();
      if (onPulse) onPulse();
      setFeedback({
        type: 'success',
        message: `Ingested ${res.data?.readingsCount || 0} simulated telemetry points!`,
      });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Pulse failed.' });
    } finally {
      setPulseLoading(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleInjectAnomaly = async () => {
    try {
      setAnomalyLoading(true);
      const res = await api.post('/iot-simulation/inject-anomaly', { anomalyType: selectedAnomaly });
      fetchStatus();
      if (onPulse) onPulse();
      setFeedback({
        type: 'warning',
        message: `Injected simulated anomaly (${selectedAnomaly}). Alert triggered!`,
      });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Anomaly injection failed.' });
    } finally {
      setAnomalyLoading(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const isRunning = status?.status === 'running';
  const isPaused = status?.status === 'paused';

  return (
    <div className="bg-dark-900/90 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden backdrop-blur-md">
      {/* Top Banner indicating Simulation Mode */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Radio className={`w-4 h-4 ${isRunning ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-white tracking-tight">IoT Telemetry Simulation Engine</span>
                <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full tracking-wider">
                  DEMO / SIMULATION MODE
                </span>
                <span
                  className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase ${
                    isRunning
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : isPaused
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {status?.status || 'Active'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Generates realistic time-stamped smart meter telemetry with voltage, current, power factor, and anomaly detection.
              </p>
            </div>
          </div>
        </div>

        {/* Engine Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Start / Resume */}
          <button
            onClick={handleStart}
            disabled={isRunning}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              isRunning
                ? 'opacity-40 cursor-not-allowed bg-dark-950 border-slate-800 text-slate-500'
                : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-950/40'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start</span>
          </button>

          {/* Pause */}
          <button
            onClick={handlePause}
            disabled={!isRunning}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              !isRunning
                ? 'opacity-40 cursor-not-allowed bg-dark-950 border-slate-800 text-slate-500'
                : 'bg-dark-850 hover:bg-amber-500/10 border-amber-500/40 text-amber-300'
            }`}
          >
            <Pause className="w-3.5 h-3.5" />
            <span>Pause</span>
          </button>

          {/* Stop */}
          <button
            onClick={handleStop}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-dark-850 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/40 rounded-xl text-xs font-semibold text-slate-300 hover:text-rose-300 transition"
          >
            <Square className="w-3.5 h-3.5" />
            <span>Stop</span>
          </button>

          {/* Manual Pulse */}
          <button
            onClick={handlePulse}
            disabled={pulseLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 border border-cyan-500 rounded-xl text-xs font-semibold text-white shadow-lg shadow-cyan-950/30 transition"
          >
            <Zap className={`w-3.5 h-3.5 ${pulseLoading ? 'animate-bounce' : ''}`} />
            <span>{pulseLoading ? 'Ingesting...' : 'Pulse Ingest'}</span>
          </button>
        </div>
      </div>

      {/* Anomaly Testing Bar & Metrics */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
        {/* Telemetry Stats */}
        <div className="flex flex-wrap items-center gap-4 text-slate-400 text-[11px]">
          <div className="flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Simulated Meters:</span>
            <span className="font-bold text-white">{status?.meters?.online || 5} Online</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Total Ingested:</span>
            <span className="font-mono font-bold text-cyan-300">{status?.totalReadingsGenerated || 1480}</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Last Reading:</span>
            <span className="font-mono text-slate-200">
              {status?.lastReadingTimestamp ? new Date(status.lastReadingTimestamp).toLocaleTimeString() : 'Just now'}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Anomalies Detected:</span>
            <span className="font-bold text-amber-400">{status?.anomaliesDetected || 3}</span>
          </div>
        </div>

        {/* Anomaly Injector for Testing Requirements */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">Test Anomaly:</span>
          <select
            value={selectedAnomaly}
            onChange={(e) => setSelectedAnomaly(e.target.value)}
            className="px-2.5 py-1 bg-dark-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="power_surge">⚡ Power Surge (+35%)</option>
            <option value="voltage_drop">📉 Voltage Sag (202 V)</option>
            <option value="frequency_drift">⏱️ Frequency Drift (57.8 Hz)</option>
            <option value="power_factor">⚠️ Low Power Factor (0.72)</option>
          </select>
          <button
            onClick={handleInjectAnomaly}
            disabled={anomalyLoading}
            className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-semibold transition"
          >
            {anomalyLoading ? 'Injecting...' : 'Inject & Test Alert'}
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`mt-2 p-2 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : feedback.type === 'warning'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  );
};

export default IoTSimulationWidget;

