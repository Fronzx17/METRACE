import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  BarChart3,
  Fingerprint,
  Compass,
  Trophy,
  Star,
  Settings,
  X,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext.jsx';

const NAV_ITEMS = [
  {
    group: 'Utama',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/activities', icon: ClipboardList, label: 'Aktivitas' },
      { to: '/timeline', icon: CalendarDays, label: 'Timeline' },
      { to: '/analytics', icon: BarChart3, label: 'Analitik' },
    ],
  },
  {
    group: 'Insight',
    items: [
      { to: '/time-fingerprint', icon: Fingerprint, label: 'Time Fingerprint', badge: 'Baru' },
      { to: '/decision-explorer', icon: Compass, label: 'Decision Explorer' },
    ],
  },
  {
    group: 'Gamifikasi',
    items: [
      { to: '/challenges', icon: Trophy, label: 'Tantangan' },
      { to: '/achievements', icon: Star, label: 'Pencapaian' },
    ],
  },
  {
    group: 'Sistem',
    items: [
      { to: '/settings', icon: Settings, label: 'Pengaturan' },
    ],
  },
];

export default function Sidebar({ open, onClose }) {
  const { isDark } = useTheme();

  const baseClasses = isDark
    ? 'bg-navy-900 border-blue-900/30 text-slate-300'
    : 'bg-white border-slate-200 text-slate-700';

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-40 border-r
          flex flex-col transition-transform duration-300 ease-in-out
          ${baseClasses}
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo area */}
        <div className={`flex items-center justify-between px-5 py-5 border-b ${isDark ? 'border-blue-900/30' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-blue">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-gradient">METRACE</span>
              <p className={`text-[10px] leading-tight ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Time Analytics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`lg:hidden p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {NAV_ITEMS.map((group) => (
            <div key={group.group}>
              <p className={`px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                {group.group}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ to, icon: Icon, label, badge }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `sidebar-link flex items-center justify-between group
                       ${isActive
                        ? isDark
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-blue-50 text-blue-600'
                        : isDark
                          ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                       }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-400' : ''}`} />
                          <span className="text-sm font-medium">{label}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {badge && (
                            <span className="badge bg-violet-500/20 text-violet-400 text-[10px]">{badge}</span>
                          )}
                          {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-400 opacity-70" />}
                        </div>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer info */}
        <div className={`px-5 py-4 border-t ${isDark ? 'border-blue-900/30' : 'border-slate-200'}`}>
          <div className={`text-[11px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
            <p className="font-medium">METRACE v1.0.0</p>
            <p>Your Time. Your Patterns. Your Story.</p>
          </div>
        </div>
      </aside>
    </>
  );
}
