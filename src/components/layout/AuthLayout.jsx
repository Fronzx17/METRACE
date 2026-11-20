import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Zap, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext.jsx';

/**
 * AuthLayout — shared layout for Login, Register, ForgotPassword pages.
 * Maintains METRACE branding with a split design:
 *   Left panel (desktop): brand showcase
 *   Right panel: form content
 */
export default function AuthLayout() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-navy-950' : 'bg-slate-50'} transition-colors duration-300`}>

      {/* ---- Left branding panel (hidden on mobile) ---- */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] flex-col relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-navy-900 to-violet-900" />
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute top-1/2 -right-10 w-64 h-64 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="absolute -bottom-20 left-10 w-56 h-56 rounded-full bg-indigo-500/10 blur-3xl" />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-10 py-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl text-white tracking-tight">METRACE</span>
              <p className="text-[11px] text-blue-300/70">Time Analytics</p>
            </div>
          </div>

          {/* Center content */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/20 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-xs text-blue-300 font-medium">Phase 2 — Authentication</span>
              </div>
              <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                Kenali Pola
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-violet-300">
                  Waktumu.
                </span>
              </h1>
              <p className="text-blue-200/60 text-base leading-relaxed max-w-sm">
                Rekam, analisis, dan optimalkan setiap momen harimu dengan METRACE — platform analitik waktu pribadimu.
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-4">
              {[
                { icon: '📊', label: 'Dashboard interaktif', desc: 'Visualisasi aktivitas harian' },
                { icon: '🎯', label: 'Tantangan & Pencapaian', desc: 'Gamifikasi produktivitasmu' },
                { icon: '🔍', label: 'Time Fingerprint', desc: 'Profil unik kebiasaan waktumu' },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center text-lg flex-shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{f.label}</p>
                    <p className="text-xs text-blue-300/50">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer tagline */}
          <p className="text-xs text-blue-300/40 font-medium">
            Your Time. Your Patterns. Your Story.
          </p>
        </div>
      </div>

      {/* ---- Right form panel ---- */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base text-gradient">METRACE</span>
          </div>
          <div className="hidden lg:block" />

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Mode terang' : 'Mode gelap'}
            className={`p-2 rounded-xl transition-all duration-200
              ${isDark
                ? 'text-slate-400 hover:text-amber-400 hover:bg-amber-400/10'
                : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
              }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>

        {/* Bottom caption */}
        <div className="px-6 py-4 text-center">
          <p className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
            © 2026 METRACE · Your Time. Your Patterns. Your Story.
          </p>
        </div>
      </div>
    </div>
  );
}
