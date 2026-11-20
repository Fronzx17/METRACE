import React from 'react';
import { useTheme } from '../../contexts/ThemeContext.jsx';

/**
 * Reusable StatCard — displays a single metric
 */
export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'blue',
  trend,
  trendLabel,
  gradient = false,
}) {
  const { isDark } = useTheme();

  const colorMap = {
    blue: 'bg-blue-500/20 text-blue-400',
    violet: 'bg-violet-500/20 text-violet-400',
    green: 'bg-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/20 text-amber-400',
    cyan: 'bg-cyan-500/20 text-cyan-400',
    pink: 'bg-pink-500/20 text-pink-400',
  };

  const bgIcon = colorMap[iconColor] || colorMap.blue;

  const cardBg = gradient
    ? isDark
      ? 'bg-gradient-to-br from-blue-900/40 to-violet-900/30 border-blue-500/30'
      : 'bg-gradient-to-br from-blue-50 to-violet-50 border-blue-200'
    : isDark
      ? 'bg-navy-800 border-blue-900/40'
      : 'bg-white border-slate-200';

  return (
    <div className={`rounded-2xl border p-5 flex flex-col gap-4 ${cardBg} transition-all duration-250 hover:scale-[1.01]`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {title}
          </p>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
          {subtitle && (
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgIcon}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend !== undefined && (
        <div className="flex items-center gap-1.5">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              trend > 0
                ? 'bg-emerald-500/15 text-emerald-400'
                : trend < 0
                ? 'bg-red-500/15 text-red-400'
                : isDark
                ? 'bg-slate-700 text-slate-400'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {trend > 0 ? `↑ ${trend}%` : trend < 0 ? `↓ ${Math.abs(trend)}%` : '→ Stabil'}
          </span>
          {trendLabel && (
            <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
