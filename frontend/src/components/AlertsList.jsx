import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Info,
  Clock,
  ShieldCheck,
} from 'lucide-react';

const severityIcons = {
  critical: {
    icon: AlertCircle,
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    badge: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  },
  info: {
    icon: Info,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    badge: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  },
};

const AlertsList = ({ alerts = [], onResolveAlert }) => {
  return (
    <div className="energy-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">
            Threshold Alarms & Load Anomalies
          </h3>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
          {alerts.filter((a) => !a.isResolved).length} Active
        </span>
      </div>

      {/* Alerts Feed */}
      <div className="mt-3 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {alerts.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs flex flex-col items-center">
            <ShieldCheck className="w-8 h-8 text-emerald-500/50 mb-2" />
            <p className="font-semibold text-slate-400">All systems operational</p>
            <p>No threshold anomalies or power surges detected.</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const config = severityIcons[alert.severity] || severityIcons.info;
            const Icon = config.icon;
            const isResolved = alert.isResolved;

            return (
              <div
                key={alert._id || alert.id}
                className={`p-3 rounded-xl border transition-all duration-150 ${
                  isResolved
                    ? 'bg-dark-950/40 border-slate-800/60 opacity-60'
                    : 'bg-dark-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-2.5">
                    <div className={`p-1.5 rounded-lg border mt-0.5 ${config.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-200">
                          {alert.title}
                        </span>
                        <span
                          className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded-md ${config.badge}`}
                        >
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {alert.message}
                      </p>

                      <div className="flex items-center space-x-3 mt-2 text-[10px] text-slate-500 font-mono">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(alert.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </span>
                        <span>•</span>
                        <span>Source: {alert.deviceName || 'Main Feeder'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div>
                    {isResolved ? (
                      <span className="flex items-center space-x-1 text-[11px] text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Resolved</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => onResolveAlert(alert._id || alert.id)}
                        className="text-[11px] font-semibold px-2.5 py-1 bg-dark-850 hover:bg-emerald-950/30 text-slate-300 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/40 rounded-lg transition"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AlertsList;

