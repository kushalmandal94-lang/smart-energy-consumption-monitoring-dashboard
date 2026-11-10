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
  Layers,
  Activity,
  ShieldAlert,
} from 'lucide-react';
import api from '../api/axios';
import IoTSimulationWidget from '../components/IoTSimulationWidget';

const SimulationView = () => {
  const [simulationData, setSimulationData] = useState(null);
  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [simRes, metersRes] = await Promise.all([
        api.get('/iot-simulation/status'),
        api.get('/meters'),
      ]);
      setSimulationData(simRes.data?.data || null);
      setMeters(metersRes.data?.data || []);
    } catch (err) {
      console.error('Simulation view load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Simulation Controls & Status Banner */}
      <IoTSimulationWidget onPulse={fetchData} />

      {/* Grid of Simulated Telemetry Meters */}
      <div className="bg-dark-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Simulated IoT Energy Meters Stream</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live reading values automatically updated by VoltPulse ingestion engine (isSimulated: true)
            </p>
          </div>
          <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Live Stream Ingesting</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-dark-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-3">Meter ID & Name</th>
                <th className="px-4 py-3">Assigned Facility</th>
                <th className="px-4 py-3">Instant Power (kW)</th>
                <th className="px-4 py-3">Voltage (V)</th>
                <th className="px-4 py-3">Current (A)</th>
                <th className="px-4 py-3">Power Factor</th>
                <th className="px-4 py-3">Frequency (Hz)</th>
                <th className="px-4 py-3">Today Consumption</th>
                <th className="px-4 py-3 text-right">Data Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {meters.map((meter) => (
                <tr key={meter.meterId} className="hover:bg-dark-850 transition">
                  <td className="px-5 py-4">
                    <div className="font-bold text-white">{meter.name}</div>
                    <div className="text-[11px] font-mono text-cyan-400">{meter.meterId}</div>
                  </td>
                  <td className="px-4 py-4 text-slate-300 font-medium">{meter.building}</td>
                  <td className="px-4 py-4 font-mono font-bold text-emerald-400">
                    {meter.currentPowerKW} kW
                  </td>
                  <td className="px-4 py-4 font-mono text-slate-300">{meter.voltage || 238.4} V</td>
                  <td className="px-4 py-4 font-mono text-slate-300">{meter.currentAmps || 54.2} A</td>
                  <td className="px-4 py-4 font-mono text-slate-300">{meter.powerFactor || 0.95}</td>
                  <td className="px-4 py-4 font-mono text-slate-300">{meter.frequencyHz || 60.0} Hz</td>
                  <td className="px-4 py-4 font-mono font-semibold text-cyan-300">
                    {meter.dailyConsumptionKWh} kWh
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-full">
                      SIMULATED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Simulation Anomaly Log */}
      <div className="bg-dark-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Simulated Anomaly & Telemetry Event Log</h3>
        </div>

        <div className="space-y-2">
          {simulationData?.recentAnomalies?.map((anom, idx) => (
            <div
              key={idx}
              className="p-3 bg-dark-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">{anom.message}</div>
                  <div className="text-[11px] text-slate-500">
                    Source: <span className="font-mono text-cyan-400">{anom.meterId}</span> • Detected at:{' '}
                    {new Date(anom.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-full uppercase">
                {anom.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimulationView;

