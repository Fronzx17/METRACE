import React from 'react';
import { useTheme } from '../../contexts/ThemeContext.jsx';

/**
 * Reusable Card component with dark/light theme support
 */
export default function Card({ children, className = '', hover = false, gradient = false }) {
  const { isDark } = useTheme();

  const base = isDark
    ? 'bg-navy-800 border-blue-900/40 shadow-card-dark'
    : 'bg-white border-slate-200 shadow-card-light';

  const hoverClass = hover
    ? isDark
      ? 'hover:border-blue-500/40 hover:shadow-glow-blue transition-all duration-250 cursor-pointer'
      : 'hover:border-blue-300 hover:shadow-md transition-all duration-250 cursor-pointer'
    : '';

  const gradientClass = gradient
    ? 'bg-gradient-to-br from-blue-600/10 to-violet-600/10 border-blue-500/20'
    : '';

  return (
    <div className={`rounded-2xl border ${base} ${hoverClass} ${gradientClass} ${className}`}>
      {children}
    </div>
  );
}
