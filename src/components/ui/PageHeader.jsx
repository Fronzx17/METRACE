import React from 'react';
import { useTheme } from '../../contexts/ThemeContext.jsx';

/**
 * PageHeader — consistent page header with title, subtitle, and optional actions
 */
export default function PageHeader({ title, subtitle, actions, badge }) {
  const { isDark } = useTheme();

  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        {badge && (
          <span className={`inline-block mb-2 px-3 py-0.5 rounded-full text-xs font-semibold
            ${isDark ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>
            {badge}
          </span>
        )}
        <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {title}
        </h2>
        {subtitle && (
          <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}
