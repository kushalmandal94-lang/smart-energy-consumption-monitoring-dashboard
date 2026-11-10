import React, { useState } from 'react';
import {
  Calculator,
  DollarSign,
  TrendingDown,
  Leaf,
  Save,
  Check,
  Shield,
  Lightbulb,
} from 'lucide-react';

const TariffCalculator = ({
  initialRate = 0.15,
  initialBudget = 500,
  initialTarget = 120,
  currentMonthKWh = 1245.8,
  currency = '$',
  onSavePreferences,
}) => {
  const [rate, setRate] = useState(initialRate);
  const [budget, setBudget] = useState(initialBudget);
  const [dailyTarget, setDailyTarget] = useState(initialTarget);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Calculations
  const projectedMonthCost = +(currentMonthKWh * rate).toFixed(2);
  const isOverBudget = projectedMonthCost > budget;
  const budgetDifference = Math.abs(budget - projectedMonthCost).toFixed(2);

  // Peak shifting optimization scenario: 25% peak load moved to off-peak (saving ~30% on that portion)
  const potentialSavings = +(projectedMonthCost * 0.18).toFixed(2);

  // Carbon footprint: 0.385 kg CO2 per kWh
  const monthlyCarbonKg = +(currentMonthKWh * 0.385).toFixed(1);
  const treesEquivalent = Math.round(monthlyCarbonKg / 21); // 1 mature tree absorbs ~21 kg CO2/year

  const handleSave = async () => {
    if (onSavePreferences) {
      await onSavePreferences({
        ratePerKWh: Number(rate),
        monthlyBudgetLimit: Number(budget),
        dailyTargetKWh: Number(dailyTarget),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="energy-card p-5 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white tracking-wide flex items-center space-x-2">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span>Tariff Simulator & Cost Optimization Engine</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Model electric utility tariff structures, budget thresholds, and carbon offsets
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-dark-850 hover:bg-emerald-950/30 text-slate-300 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-xs font-semibold transition"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Settings Saved</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Tariffs</span>
            </>
          )}
        </button>
      </div>

      {/* Simulator Inputs & Result Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Interactive Controls */}
        <div className="space-y-4 bg-dark-950/60 p-4 rounded-xl border border-slate-800">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">Utility Unit Rate:</span>
              <span className="font-mono text-emerald-400">
                {currency} {Number(rate).toFixed(3)} / kWh
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.50"
              step="0.01"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>{currency}0.05 (Off-Peak)</span>
              <span>{currency}0.25 (Standard)</span>
              <span>{currency}0.50 (Peak Demand)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">Monthly Budget Threshold:</span>
              <span className="font-mono text-cyan-400">
                {currency} {budget}
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="2500"
              step="50"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>{currency}100</span>
              <span>{currency}1,000</span>
              <span>{currency}2,500</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">Daily Energy Consumption Target:</span>
              <span className="font-mono text-amber-400">{dailyTarget} kWh/day</span>
            </div>
            <input
              type="range"
              min="20"
              max="500"
              step="10"
              value={dailyTarget}
              onChange={(e) => setDailyTarget(e.target.value)}
              className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>20 kWh</span>
              <span>250 kWh</span>
              <span>500 kWh</span>
            </div>
          </div>
        </div>

        {/* Right: Real-time Projection Summary */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Projected Bill Card */}
            <div
              className={`p-4 rounded-xl border ${
                isOverBudget
                  ? 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                  : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
              }`}
            >
              <span className="text-[11px] uppercase tracking-wider font-semibold block text-slate-400">
                Estimated Month Bill
              </span>
              <div className="text-2xl font-extrabold font-mono mt-1 text-white">
                {currency} {projectedMonthCost}
              </div>
              <p className="text-xs mt-1">
                {isOverBudget ? (
                  <span className="text-rose-400 font-semibold">
                    Exceeds budget by {currency} {budgetDifference}
                  </span>
                ) : (
                  <span className="text-emerald-400 font-semibold">
                    Within limit ({currency} {budgetDifference} cushion)
                  </span>
                )}
              </p>
            </div>

            {/* Smart Savings Recommendation Card */}
            <div className="p-4 rounded-xl border bg-dark-950/70 border-slate-800">
              <span className="text-[11px] uppercase tracking-wider font-semibold block text-slate-400 flex items-center space-x-1">
                <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                <span>Peak Load Shifting</span>
              </span>
              <div className="text-2xl font-extrabold font-mono mt-1 text-emerald-400">
                -{currency} {potentialSavings}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Potential monthly savings by running heavy loads off-peak.
              </p>
            </div>
          </div>

          {/* Environmental Sustainability Offset */}
          <div className="p-4 rounded-xl border border-emerald-900/30 bg-gradient-to-r from-emerald-950/30 to-dark-950 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  Carbon Emission Impact
                </span>
                <span className="text-xs text-slate-400">
                  Total footprint: <span className="text-slate-200 font-mono font-bold">{monthlyCarbonKg} kg CO₂</span> this month
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-emerald-400">
                ~{treesEquivalent} Trees
              </span>
              <span className="text-[10px] text-slate-500 block">Absorption Equivalent</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TariffCalculator;

