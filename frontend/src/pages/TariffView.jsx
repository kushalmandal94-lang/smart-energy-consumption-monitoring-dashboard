import React from 'react';
import TariffCalculator from '../components/TariffCalculator';
import {
  DollarSign,
  Lightbulb,
  Zap,
  TrendingDown,
  Calendar,
  CheckCircle,
} from 'lucide-react';

const TariffView = ({ summary, onSavePreferences }) => {
  return (
    <div className="space-y-6">
      <TariffCalculator
        initialRate={summary?.ratePerKWh || 0.15}
        initialBudget={summary?.monthlyBudget || 500}
        initialTarget={120}
        currentMonthKWh={summary?.monthKWh || 1245.8}
        currency={summary?.currency || '$'}
        onSavePreferences={onSavePreferences}
      />

      {/* Energy Efficiency & Cost Reduction Tips */}
      <div className="energy-card p-5">
        <h4 className="text-sm font-bold text-white flex items-center space-x-2 mb-3">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>Recommended Energy Cost Optimization Actions</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-dark-950/80 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>EV Smart Scheduling</span>
            </div>
            <p className="text-slate-400">
              Shift fleet EV charging to 01:00 - 05:00 AM off-peak window to capture lower tariff rates.
            </p>
          </div>

          <div className="p-3.5 bg-dark-950/80 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>HVAC Setpoint Optimization</span>
            </div>
            <p className="text-slate-400">
              Increasing chiller setpoint by 1°C during peak periods reduces compressor load by ~6%.
            </p>
          </div>

          <div className="p-3.5 bg-dark-950/80 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center space-x-2 text-purple-400 font-bold">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Vampire Load Disconnection</span>
            </div>
            <p className="text-slate-400">
              Automated standby relay cutoffs save ~45 kWh monthly on idle office machinery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TariffView;

