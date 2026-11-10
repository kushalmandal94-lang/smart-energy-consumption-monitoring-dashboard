import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';

const colorStyles = {
  green: {
    bgIcon: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    borderHover: 'hover:border-emerald-500/50',
    indicator: 'bg-emerald-500',
  },
  blue: {
    bgIcon: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    borderHover: 'hover:border-blue-500/50',
    indicator: 'bg-blue-500',
  },
  amber: {
    bgIcon: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    borderHover: 'hover:border-amber-500/50',
    indicator: 'bg-amber-500',
  },
  purple: {
    bgIcon: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    borderHover: 'hover:border-purple-500/50',
    indicator: 'bg-purple-500',
  },
  rose: {
    bgIcon: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    borderHover: 'hover:border-rose-500/50',
    indicator: 'bg-rose-500',
  },
};

const StatCard = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  color = 'green',
}) => {
  const currentStyle = colorStyles[color] || colorStyles.green;

  return (
    <div
      className={`energy-card p-5 relative overflow-hidden transition-all duration-200 ${currentStyle.borderHover}`}
    >
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${currentStyle.indicator}`} />

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {value}
            </span>
            {unit && <span className="text-sm font-semibold text-slate-400">{unit}</span>}
          </div>
        </div>

        <div className={`p-2.5 rounded-xl border ${currentStyle.bgIcon}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>

      {/* Footer Trend & Subtitle */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-400">{subtitle}</span>
        {trend && (
          <div
            className={`flex items-center space-x-1 font-semibold ${
              trendPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {trendPositive ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : (
              <TrendingUp className="w-3.5 h-3.5" />
            )}
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;

