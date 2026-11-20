import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, Sun, Moon, Bell, Settings, LogOut, ChevronDown, Check,
  Sparkles, Calendar, Trophy, Info, X
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useActivities } from '../../hooks/useActivities.js';

const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Ringkasan aktivitas harianmu' },
  '/activities': { title: 'Aktivitas', subtitle: 'Catat dan kelola aktivitas' },
  '/timeline': { title: 'Timeline', subtitle: 'Lihat alur waktu aktivitasmu' },
  '/analytics': { title: 'Analitik', subtitle: 'Pola dan tren penggunaan waktu' },
  '/time-fingerprint': { title: 'Time Fingerprint', subtitle: 'Profil unik kebiasaan waktumu' },
  '/decision-explorer': { title: 'Decision Explorer', subtitle: 'Simulasi alokasi waktu' },
  '/challenges': { title: 'Tantangan', subtitle: 'Capai target waktumu' },
  '/achievements': { title: 'Pencapaian', subtitle: 'Koleksi badge dan rewardmu' },
  '/settings': { title: 'Pengaturan', subtitle: 'Konfigurasi preferensi akunmu' },
};

export default function Header({ onMenuOpen }) {
  const { isDark, toggleTheme } = useTheme();
  const { user, profile, logout } = useAuth();
  const { activities } = useActivities();
  const location = useLocation();
  const navigate = useNavigate();
  const page = PAGE_TITLES[location.pathname] || { title: 'METRACE', subtitle: '' };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Derive display name: profile > user metadata > email prefix > fallback
  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Pengguna';

  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const handleSettings = () => {
    setDropdownOpen(false);
    navigate('/settings');
  };

  const handleOpenNotif = () => {
    setNotifOpen((prev) => !prev);
    setHasUnread(false);
  };

  // Build notifications dynamically based on user state
  const notifications = [
    {
      id: 'welcome',
      icon: Sparkles,
      color: 'text-amber-400 bg-amber-400/10',
      title: 'Selamat Datang di METRACE',
      message: `Halo ${displayName}! Aplikasi pelacak waktu dan Time Fingerprint siap digunakan.`,
      time: 'Hari ini',
    },
    {
      id: 'daily',
      icon: Calendar,
      color: 'text-blue-400 bg-blue-400/10',
      title: 'Pengingat Aktivitas',
      message: activities?.length > 0
        ? `Kamu telah mencatat ${activities.length} aktivitas sejauh ini. Lanjutkan konsistensimu!`
        : 'Jangan lupa mencatat aktivitas harianmu untuk membentuk Time Fingerprint yang akurat.',
      time: 'Baru saja',
    },
    {
      id: 'gamification',
      icon: Trophy,
      color: 'text-emerald-400 bg-emerald-400/10',
      title: 'Tantangan & Pencapaian',
      message: 'Periksa menu Gamifikasi untuk melihat progres badge dan tantangan mingguanmu.',
      time: '1 jam lalu',
    },
  ];

  const baseClasses = isDark
    ? 'bg-navy-900/80 border-blue-900/30 text-slate-200'
    : 'bg-white/85 border-slate-200 text-slate-800';

  return (
    <header
      className={`
        sticky top-0 z-20 flex items-center justify-between
        px-4 sm:px-6 h-16 border-b backdrop-blur-md
        transition-colors duration-300
        ${baseClasses}
      `}
    >
      {/* Left: hamburger + page title */}
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={onMenuOpen}
          className={`
            lg:hidden p-2 rounded-xl transition-colors flex-shrink-0
            ${isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}
          `}
          aria-label="Buka menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className={`text-base sm:text-lg font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {page.title}
          </h1>
          {page.subtitle && (
            <p className={`text-xs hidden sm:block truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {page.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
          className={`
            p-2 rounded-xl transition-all duration-200
            ${isDark
              ? 'text-slate-400 hover:text-amber-400 hover:bg-amber-400/10'
              : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
            }
          `}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notification bell & dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleOpenNotif}
            className={`
              p-2 rounded-xl relative transition-colors
              ${isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100'}
              ${notifOpen ? isDark ? 'bg-white/5' : 'bg-slate-100' : ''}
            `}
            aria-label="Notifikasi"
            aria-expanded={notifOpen}
          >
            <Bell className="w-4 h-4" />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-navy-900" />
            )}
          </button>

          {notifOpen && (
            <div
              className={`
                absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border shadow-2xl overflow-hidden z-50
                animate-fade-in
                ${isDark ? 'bg-navy-800 border-blue-900/40 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}
              `}
            >
              {/* Header */}
              <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-blue-900/40' : 'border-slate-100'}`}>
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-bold">Notifikasi</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-semibold">
                    {notifications.length}
                  </span>
                </div>
                <button
                  onClick={() => setNotifOpen(false)}
                  className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Notification list */}
              <div className={`divide-y max-h-80 overflow-y-auto ${isDark ? 'divide-blue-900/30' : 'divide-slate-100'}`}>
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div
                      key={n.id}
                      className={`p-3.5 flex items-start gap-3 transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${n.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{n.title}</p>
                          <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{n.time}</span>
                        </div>
                        <p className={`text-xs mt-0.5 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {n.message}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className={`p-2.5 text-center border-t text-[11px] font-medium ${isDark ? 'border-blue-900/40 bg-navy-900/40 text-slate-400' : 'border-slate-100 bg-slate-50 text-slate-500'}`}>
                Semua notifikasi tersinkronisasi
              </div>
            </div>
          )}
        </div>

        {/* User dropdown */}
        <div className="relative ml-1" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((p) => !p)}
            className={`
              flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-colors
              ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'}
              ${dropdownOpen ? isDark ? 'bg-white/5' : 'bg-slate-100' : ''}
            `}
            aria-label="Menu pengguna"
            aria-expanded={dropdownOpen}
          >
            {/* Avatar circle with initials */}
            <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center flex-shrink-0">
              <span className="text-[11px] font-bold text-white leading-none">{initials}</span>
            </div>
            <span className={`text-sm font-medium hidden sm:block max-w-[120px] truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {displayName}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 hidden sm:block flex-shrink-0 transition-transform duration-200
              ${isDark ? 'text-slate-500' : 'text-slate-400'}
              ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div
              className={`
                absolute right-0 top-full mt-2 w-52 rounded-2xl border shadow-xl overflow-hidden z-50
                animate-fade-in
                ${isDark ? 'bg-navy-800 border-blue-900/40' : 'bg-white border-slate-200'}
              `}
            >
              {/* User info */}
              <div className={`px-4 py-3 border-b ${isDark ? 'border-blue-900/40' : 'border-slate-100'}`}>
                <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {displayName}
                </p>
                <p className={`text-xs truncate mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {user?.email}
                </p>
              </div>

              {/* Menu items */}
              <div className="p-1.5">
                <button
                  onClick={handleSettings}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors text-left
                    ${isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <Settings className="w-4 h-4 text-blue-400" />
                  Pengaturan
                </button>

                <div className={`my-1 h-px ${isDark ? 'bg-blue-900/40' : 'bg-slate-100'}`} />

                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors text-left
                    ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50'}`}
                >
                  <LogOut className="w-4 h-4" />
                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
