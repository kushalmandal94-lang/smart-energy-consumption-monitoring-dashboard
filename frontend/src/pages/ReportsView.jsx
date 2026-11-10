import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Building2,
  CheckCircle,
  FileSpreadsheet,
  RefreshCw,
  Zap,
  TrendingDown,
  Clock,
  Leaf,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const ReportsView = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('mandatory'); // 'mandatory' or 'archive'
  const [mandatoryReportType, setMandatoryReportType] = useState('daily_usage'); // 'daily_usage', 'building_wise', 'peak_demand', 'efficiency_summary'
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2026-11-09');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const fetchMandatoryReport = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/reports/mandatory/${mandatoryReportType}`, {
        params: { startDate, endDate },
      });
      setReportData(res.data);
    } catch (err) {
      console.error('Failed to load mandatory report:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchArchive = async () => {
    try {
      const res = await api.get('/reports');
      setReports(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load archive:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'mandatory') {
      fetchMandatoryReport();
    } else {
      fetchArchive();
    }
  }, [mandatoryReportType, activeTab]);

  const handleExportCSV = async () => {
    try {
      const endpoint =
        activeTab === 'mandatory'
          ? `/reports/${mandatoryReportType}/export?format=csv`
          : `/reports/${reports[0]?.reportId || 'REP-DAILY-01'}/export?format=csv`;

      const res = await api.get(endpoint, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${mandatoryReportType}_report.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setFeedback({ type: 'success', message: 'CSV report downloaded successfully.' });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to download CSV' });
    } finally {
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Enterprise Energy Reports</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
              4 University Mandatory Reports
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Standardized audit reports with hourly breakdowns, building comparisons, peak demand logs & efficiency analytics.
          </p>
        </div>

        {/* Global Export Actions */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-dark-850 hover:bg-dark-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrintPDF}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-950/40 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF Export</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center space-x-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Primary Tab Navigation */}
      <div className="flex border-b border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab('mandatory')}
          className={`pb-3 text-xs font-bold transition border-b-2 flex items-center space-x-2 ${
            activeTab === 'mandatory'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>4 Mandatory University Reports</span>
        </button>
        <button
          onClick={() => setActiveTab('archive')}
          className={`pb-3 text-xs font-bold transition border-b-2 flex items-center space-x-2 ${
            activeTab === 'archive'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Report Archive & History</span>
        </button>
      </div>

      {activeTab === 'mandatory' && (
        <div className="space-y-6">
          {/* Sub-selector for the 4 Mandatory Reports */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                id: 'daily_usage',
                label: 'A. Daily Energy Usage',
                sub: 'Hourly consumption, cost & delta',
                icon: Zap,
              },
              {
                id: 'building_wise',
                label: 'B. Building-wise Consumption',
                sub: 'Facility comparison & peak load',
                icon: Building2,
              },
              {
                id: 'peak_demand',
                label: 'C. Peak Demand Report',
                sub: 'Max kW, timestamp & time-of-use',
                icon: Clock,
              },
              {
                id: 'efficiency_summary',
                label: 'D. Energy Efficiency Summary',
                sub: 'Saved kWh, carbon & recommendations',
                icon: Leaf,
              },
            ].map((rep) => {
              const Icon = rep.icon;
              const isSelected = mandatoryReportType === rep.id;
              return (
                <button
                  key={rep.id}
                  onClick={() => setMandatoryReportType(rep.id)}
                  className={`p-4 rounded-2xl border text-left transition ${
                    isSelected
                      ? 'bg-dark-850 border-emerald-500/50 shadow-lg shadow-emerald-950/20'
                      : 'bg-dark-900 border-slate-800 hover:bg-dark-850'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 mb-1.5">
                    <div
                      className={`p-2 rounded-xl ${
                        isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-dark-950 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {rep.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 pl-9">{rep.sub}</p>
                </button>
              );
            })}
          </div>

          {/* Date Filtering Bar */}
          <div className="bg-dark-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-slate-400 flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Date Range:</span>
              </span>
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2.5 py-1.5 bg-dark-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <span className="text-slate-500">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2.5 py-1.5 bg-dark-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                onClick={fetchMandatoryReport}
                className="px-3 py-1.5 bg-dark-850 hover:bg-dark-800 border border-slate-800 rounded-xl text-slate-200 font-semibold"
              >
                Apply Filter
              </button>
            </div>

            <span className="text-[11px] text-slate-400 font-mono">
              Report Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
            </span>
          </div>

          {/* REPORT A: Daily Energy Usage Report */}
          {mandatoryReportType === 'daily_usage' && reportData && (
            <div className="space-y-6">
              {/* Summary Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-dark-900 border border-slate-800 rounded-2xl p-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Total Daily Consumption</p>
                  <h3 className="text-3xl font-black text-white mt-1">
                    {reportData.metrics?.totalDailyKWh} <span className="text-sm font-normal text-slate-400">kWh</span>
                  </h3>
                  <div className="flex items-center space-x-1 text-xs text-emerald-400 mt-2">
                    <ArrowDownRight className="w-4 h-4" />
                    <span>{reportData.metrics?.percentageChange}% vs Yesterday</span>
                  </div>
                </div>

                <div className="bg-dark-900 border border-slate-800 rounded-2xl p-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Daily Energy Cost</p>
                  <h3 className="text-3xl font-black text-emerald-400 mt-1">
                    ${reportData.metrics?.totalDailyCost}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2">Blended rate $0.15/kWh</p>
                </div>

                <div className="bg-dark-900 border border-slate-800 rounded-2xl p-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Previous Day Baseline</p>
                  <h3 className="text-3xl font-black text-slate-300 mt-1">
                    {reportData.metrics?.previousDayKWh} <span className="text-sm font-normal text-slate-400">kWh</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-2">Saved {Math.abs(reportData.metrics?.deltaKWh)} kWh today</p>
                </div>

                <div className="bg-dark-900 border border-slate-800 rounded-2xl p-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Peak Demand (kW)</p>
                  <h3 className="text-3xl font-black text-cyan-400 mt-1">
                    {reportData.metrics?.peakDemandKW} <span className="text-sm font-normal text-slate-400">kW</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-2">Recorded at {reportData.metrics?.peakTime}</p>
                </div>
              </div>

              {/* 24-Hour Hourly Consumption Curve */}
              <div className="bg-dark-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white mb-4">
                  24-Hour Hourly Consumption & Solar Offset Curve
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reportData.hourlyBreakdown || []}>
                      <defs>
                        <linearGradient id="colorKWh" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155' }} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="consumptionKWh"
                        stroke="#10b981"
                        fill="url(#colorKWh)"
                        name="Gross Consumption (kWh)"
                      />
                      <Area
                        type="monotone"
                        dataKey="solarKWh"
                        stroke="#06b6d4"
                        fill="url(#colorSolar)"
                        name="Solar Generation (kWh)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* REPORT B: Building-wise Consumption Report */}
          {mandatoryReportType === 'building_wise' && reportData && (
            <div className="space-y-6">
              {/* Highest-Consuming Facility Banner */}
              <div className="bg-dark-900 border border-amber-500/40 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">
                      Highest-Consuming Facility Identified
                    </span>
                    <h3 className="text-xl font-bold text-white">{reportData.highestConsumingFacility}</h3>
                    <p className="text-xs text-slate-400">
                      Consumes 37.4% of campus load due to industrial refrigeration and cold storage units.
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-amber-400">13,450 kWh</div>
                  <div className="text-xs text-slate-400">$2,017.50 / month</div>
                </div>
              </div>

              {/* Facility Comparison Chart */}
              <div className="bg-dark-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white mb-4">Building-wise Energy Usage Comparison</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.facilities || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155' }} />
                      <Bar dataKey="totalKWh" fill="#10b981" name="Consumption (kWh)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Table of Facilities */}
              <div className="bg-dark-900 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-dark-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-5 py-3">Facility</th>
                      <th className="px-4 py-3">Code</th>
                      <th className="px-4 py-3">Consumption</th>
                      <th className="px-4 py-3">Cost ($)</th>
                      <th className="px-4 py-3">Carbon (kg CO2)</th>
                      <th className="px-4 py-3">Efficiency Score</th>
                      <th className="px-4 py-3 text-right">Campus Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {reportData.facilities?.map((f) => (
                      <tr key={f.code} className="hover:bg-dark-850">
                        <td className="px-5 py-3.5 font-bold text-white flex items-center space-x-2">
                          <span>{f.name}</span>
                          {f.isHighest && (
                            <span className="px-2 py-0.5 text-[9px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full">
                              HIGHEST LOAD
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-cyan-400">{f.code}</td>
                        <td className="px-4 py-3.5 font-mono font-bold text-emerald-400">{f.totalKWh} kWh</td>
                        <td className="px-4 py-3.5 font-mono text-slate-300">${f.cost}</td>
                        <td className="px-4 py-3.5 font-mono text-slate-300">{f.carbonKg} kg</td>
                        <td className="px-4 py-3.5 font-semibold text-slate-200">{f.efficiencyScore}%</td>
                        <td className="px-4 py-3.5 text-right font-bold text-slate-300">{f.sharePercent}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT C: Peak Demand Report */}
          {mandatoryReportType === 'peak_demand' && reportData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-dark-900 border border-slate-800 rounded-2xl p-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Max Power Demand</p>
                  <h3 className="text-3xl font-black text-rose-400 mt-1">
                    {reportData.metrics?.maxDemandKW} <span className="text-sm font-normal text-slate-400">kW</span>
                  </h3>
                  <div className="text-xs text-slate-400 mt-2 font-mono">
                    Peak Timestamp: 14:35:00 (Today)
                  </div>
                </div>

                <div className="bg-dark-900 border border-slate-800 rounded-2xl p-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Peak Period Consumption</p>
                  <h3 className="text-3xl font-black text-amber-400 mt-1">
                    {reportData.metrics?.peakHoursConsumptionKWh}{' '}
                    <span className="text-sm font-normal text-slate-400">kWh</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-2">
                    {reportData.metrics?.peakHoursPercent}% of total load (${reportData.metrics?.peakCost})
                  </p>
                </div>

                <div className="bg-dark-900 border border-slate-800 rounded-2xl p-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Off-Peak Consumption</p>
                  <h3 className="text-3xl font-black text-cyan-400 mt-1">
                    {reportData.metrics?.offPeakHoursConsumptionKWh}{' '}
                    <span className="text-sm font-normal text-slate-400">kWh</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-2">
                    {reportData.metrics?.offPeakHoursPercent}% of total load (${reportData.metrics?.offPeakCost})
                  </p>
                </div>
              </div>

              {/* Demand Trend Chart */}
              <div className="bg-dark-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white mb-4">
                  24-Hour Demand Trend vs Utility Contract Limit (70.0 kW)
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={reportData.demandTrend || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="timeLabel" stroke="#64748b" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155' }} />
                      <Line
                        type="monotone"
                        dataKey="powerDemandKW"
                        stroke="#f43f5e"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        name="Actual Demand (kW)"
                      />
                      <Line
                        type="monotone"
                        dataKey="thresholdLimitKW"
                        stroke="#f59e0b"
                        strokeDasharray="5 5"
                        name="Contract Ceiling (70 kW)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* REPORT D: Energy Efficiency Summary */}
          {mandatoryReportType === 'efficiency_summary' && reportData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-dark-900 border border-slate-800 rounded-2xl p-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Energy Efficiency Score</p>
                  <h3 className="text-3xl font-black text-emerald-400 mt-1">
                    {reportData.metrics?.energyEfficiencyScore}%
                  </h3>
                  <p className="text-xs text-slate-400 mt-2">Composite ISO 50001 benchmark</p>
                </div>

                <div className="bg-dark-900 border border-slate-800 rounded-2xl p-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Energy Saved vs Baseline</p>
                  <h3 className="text-3xl font-black text-cyan-400 mt-1">
                    {reportData.metrics?.energySavedKWh} <span className="text-sm font-normal text-slate-400">kWh</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-2">
                    {reportData.metrics?.savingsPercentage}% below historical baseline
                  </p>
                </div>

                <div className="bg-dark-900 border border-slate-800 rounded-2xl p-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Renewable Energy Share</p>
                  <h3 className="text-3xl font-black text-amber-400 mt-1">
                    {reportData.metrics?.renewableEnergySharePercent}%
                  </h3>
                  <p className="text-xs text-slate-400 mt-2">Solar PV + Micro-wind</p>
                </div>

                <div className="bg-dark-900 border border-slate-800 rounded-2xl p-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Carbon Avoided</p>
                  <h3 className="text-3xl font-black text-emerald-300 mt-1">
                    {reportData.metrics?.carbonEmissionReductionKg}{' '}
                    <span className="text-sm font-normal text-slate-400">kg</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-2">Avoided CO2 emissions</p>
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="bg-dark-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Actionable Recommendations for Energy Optimization</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {reportData.recommendations?.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-4 bg-dark-950 rounded-xl border border-slate-800 space-y-2 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {rec.category}
                        </span>
                        <span className="text-[11px] font-semibold text-amber-400">Impact: {rec.impact}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white">{rec.title}</h4>
                      <p className="text-[11px] text-slate-400">Estimated Savings: {rec.estimatedSavings}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Archive Tab */}
      {activeTab === 'archive' && (
        <div className="bg-dark-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Report Generation History</h3>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-dark-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-3">Report ID</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Facility</th>
                <th className="px-4 py-3">Date Range</th>
                <th className="px-4 py-3">Generated By</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {reports.map((r) => (
                <tr key={r.reportId} className="hover:bg-dark-850">
                  <td className="px-5 py-3 font-mono text-cyan-400 font-bold">{r.reportId}</td>
                  <td className="px-4 py-3 font-semibold text-white">{r.title}</td>
                  <td className="px-4 py-3 text-slate-300">{r.building}</td>
                  <td className="px-4 py-3 text-slate-400">{r.dateRange}</td>
                  <td className="px-4 py-3 text-slate-400">{r.generatedBy}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={handleExportCSV}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                    >
                      Download CSV
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReportsView;
