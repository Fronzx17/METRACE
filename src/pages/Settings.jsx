import React, { useState } from 'react';
import { Sun, Moon, Bell, Shield, Database, Palette, Info, ChevronRight, User, LogOut, Loader2, CheckCircle2, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useActivities } from '../hooks/useActivities.js';
import { isSupabaseConfigured } from '../lib/supabase.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';

/* ---- Reusable sub-components ---- */
function SettingsSection({ title, icon: Icon, children, isDark }) {
  return (
    <Card className="overflow-hidden">
      <div className={`flex items-center gap-3 px-5 py-4 border-b ${isDark ? 'border-blue-900/40' : 'border-slate-200'}`}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-blue-500/15' : 'bg-blue-50'}`}>
          <Icon className="w-4 h-4 text-blue-400" />
        </div>
        <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
      </div>
      <div className={`divide-y ${isDark ? 'divide-blue-900/30' : 'divide-slate-100'}`}>{children}</div>
    </Card>
  );
}

function SettingsRow({ label, description, control, isDark }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="min-w-0">
        <p className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{label}</p>
        {description && (
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">{control}</div>
    </div>
  );
}

function Toggle({ checked, onChange, color = '#3b82f6' }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative rounded-full transition-all duration-200 focus:outline-none"
      style={{ background: checked ? color : '#334155', width: '40px', height: '22px' }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
        style={{ transform: checked ? 'translateX(18px)' : 'translateX(0)' }}
      />
    </button>
  );
}

export default function Settings() {
  const { isDark, toggleTheme } = useTheme();
  const { user, profile, updateProfile, logout } = useAuth();
  const { activities } = useActivities();
  const navigate = useNavigate();

  const [notifs, setNotifs] = useState({ daily: true, weekly: true, challenges: false });
  const [privacy, setPrivacy] = useState({ analytics: true });
  const [exported, setExported] = useState(false);

  /* ---- Profile editing state ---- */
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(profile?.full_name || user?.user_metadata?.full_name || '');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [nameError, setNameError] = useState('');

  // Sync nameValue when profile loads
  React.useEffect(() => {
    if (profile?.full_name && !editingName) {
      setNameValue(profile.full_name);
    }
  }, [profile?.full_name]);

  const handleSaveName = async () => {
    if (!nameValue.trim()) { setNameError('Nama tidak boleh kosong.'); return; }
    if (nameValue.trim().length < 2) { setNameError('Nama terlalu pendek.'); return; }
    setNameError('');
    setNameSaving(true);
    const { error } = await updateProfile({ full_name: nameValue.trim() });
    setNameSaving(false);
    if (error) {
      setNameError('Gagal menyimpan. Coba lagi.');
    } else {
      setNameSaved(true);
      setEditingName(false);
      setTimeout(() => setNameSaved(false), 3000);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleExportData = () => {
    const exportData = {
      exported_at: new Date().toISOString(),
      user: {
        email: user?.email,
        full_name: profile?.full_name || displayName,
      },
      total_activities: activities.length,
      activities: activities,
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportData, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `metrace_activities_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  /* ---- Derived values ---- */
  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Pengguna';

  return (
    <div className="space-y-5 animate-slide-up">
      <PageHeader title="Pengaturan" subtitle="Konfigurasi preferensi dan akun METRACE kamu" />

      {/* ---- Profile Section ---- */}
      <SettingsSection title="Profil Pengguna" icon={User} isDark={isDark}>
        {/* Avatar + name display */}
        <div className={`flex items-center gap-4 px-5 py-5 ${isDark ? 'bg-navy-900/40' : 'bg-slate-50/60'}`}>
          <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center flex-shrink-0 shadow-glow-blue">
            <span className="text-lg font-bold text-white">
              {displayName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className={`font-bold text-base truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{displayName}</p>
            <p className={`text-xs truncate mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{user?.email}</p>
            {user?.email_confirmed_at && (
              <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-emerald-400">
                <CheckCircle2 className="w-3 h-3" /> Email terverifikasi
              </span>
            )}
          </div>
        </div>

        {/* Edit name */}
        <SettingsRow
          label="Nama Lengkap"
          description="Nama yang ditampilkan di seluruh aplikasi"
          isDark={isDark}
          control={
            !editingName ? (
              <button
                onClick={() => { setEditingName(true); setNameValue(profile?.full_name || user?.user_metadata?.full_name || ''); }}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors
                  ${isDark ? 'border-blue-900/40 text-slate-400 hover:border-blue-500/40 hover:text-blue-400' : 'border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-500'}`}
              >
                {nameSaved ? '✓ Tersimpan' : 'Ubah'}
              </button>
            ) : null
          }
        />
        {editingName && (
          <div className="px-5 pb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={nameValue}
                onChange={(e) => { setNameValue(e.target.value); if (nameError) setNameError(''); }}
                className={`flex-1 px-3 py-2 rounded-xl text-sm outline-none border transition-colors
                  ${isDark
                    ? 'bg-navy-900 border-blue-900/50 text-slate-100 focus:border-blue-500/70'
                    : 'bg-white border-slate-200 text-slate-900 focus:border-blue-400'
                  }
                  ${nameError ? 'border-red-500/60' : ''}`}
                placeholder="Nama lengkapmu"
                autoFocus
              />
              <button
                onClick={handleSaveName}
                disabled={nameSaving}
                className="btn-primary px-3 py-2 text-xs disabled:opacity-60"
              >
                {nameSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Simpan'}
              </button>
              <button
                onClick={() => { setEditingName(false); setNameError(''); }}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors
                  ${isDark ? 'border-blue-900/40 text-slate-400 hover:text-slate-200' : 'border-slate-200 text-slate-500 hover:text-slate-700'}`}
              >
                Batal
              </button>
            </div>
            {nameError && <p className="mt-1.5 text-xs text-red-400">{nameError}</p>}
          </div>
        )}

        <SettingsRow
          label="Email"
          description="Alamat email tidak dapat diubah dari sini"
          isDark={isDark}
          control={
            <span className={`text-xs font-medium truncate max-w-[180px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {user?.email}
            </span>
          }
        />
      </SettingsSection>

      {/* ---- Appearance ---- */}
      <SettingsSection title="Tampilan" icon={Palette} isDark={isDark}>
        <SettingsRow
          label="Tema Aplikasi"
          description={`Aktif: ${isDark ? 'Mode Gelap 🌙' : 'Mode Terang ☀️'}`}
          isDark={isDark}
          control={
            <div className="flex items-center gap-2">
              <Sun className={`w-4 h-4 ${!isDark ? 'text-amber-400' : 'text-slate-600'}`} />
              <Toggle checked={isDark} onChange={toggleTheme} color="#6366f1" />
              <Moon className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-slate-600'}`} />
            </div>
          }
        />
        <SettingsRow
          label="Bahasa"
          description="Bahasa antarmuka aplikasi"
          isDark={isDark}
          control={
            <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span>Indonesia</span>
              <ChevronRight className="w-4 h-4 opacity-40" />
            </div>
          }
        />
      </SettingsSection>

      {/* ---- Notifications ---- */}
      <SettingsSection title="Notifikasi" icon={Bell} isDark={isDark}>
        <SettingsRow
          label="Pengingat Harian"
          description="Ingatkan saya untuk mencatat aktivitas setiap hari"
          isDark={isDark}
          control={<Toggle checked={notifs.daily} onChange={(v) => setNotifs((p) => ({ ...p, daily: v }))} />}
        />
        <SettingsRow
          label="Ringkasan Mingguan"
          description="Terima ringkasan produktivitas setiap Senin pagi"
          isDark={isDark}
          control={<Toggle checked={notifs.weekly} onChange={(v) => setNotifs((p) => ({ ...p, weekly: v }))} />}
        />
        <SettingsRow
          label="Alert Tantangan"
          description="Notifikasi ketika tantangan hampir berakhir"
          isDark={isDark}
          control={<Toggle checked={notifs.challenges} onChange={(v) => setNotifs((p) => ({ ...p, challenges: v }))} />}
        />
      </SettingsSection>

      {/* ---- Privacy ---- */}
      <SettingsSection title="Privasi & Data" icon={Shield} isDark={isDark}>
        <SettingsRow
          label="Analitik Anonim"
          description="Bantu tingkatkan METRACE dengan data penggunaan anonim"
          isDark={isDark}
          control={<Toggle checked={privacy.analytics} onChange={(v) => setPrivacy((p) => ({ ...p, analytics: v }))} color="#10b981" />}
        />
        <SettingsRow
          label="Ekspor Data"
          description="Unduh seluruh data riwayat aktivitasmu dalam format JSON"
          isDark={isDark}
          control={
            <button
              onClick={handleExportData}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors flex items-center gap-1.5
              ${exported
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : isDark
                  ? 'border-blue-900/40 text-slate-400 hover:border-blue-500/40 hover:text-blue-400'
                  : 'border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-500'}`}
            >
              <Download className="w-3.5 h-3.5" />
              {exported ? 'Terekspor ✓' : 'Ekspor JSON'}
            </button>
          }
        />
        <SettingsRow
          label="Lupa Kata Sandi"
          description="Kirim tautan reset kata sandi ke emailmu"
          isDark={isDark}
          control={
            <button
              onClick={() => navigate('/forgot-password')}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors
              ${isDark ? 'border-blue-900/40 text-slate-400 hover:border-blue-500/40 hover:text-blue-400' : 'border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-500'}`}>
              Reset
            </button>
          }
        />
      </SettingsSection>

      {/* ---- Database ---- */}
      <SettingsSection title="Koneksi Database" icon={Database} isDark={isDark}>
        <SettingsRow
          label="Status Supabase"
          description="Koneksi database untuk sinkronisasi data"
          isDark={isDark}
          control={
            isSupabaseConfigured ? (
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                Terhubung ✓
              </span>
            ) : (
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold
                ${isDark ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                Belum Dikonfigurasi
              </span>
            )
          }
        />
        {!isSupabaseConfigured && (
          <div className={`px-5 py-3 ${isDark ? 'bg-navy-900/60' : 'bg-slate-50'}`}>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Tambahkan kredensial Supabase di file{' '}
              <code className={`px-1 py-0.5 rounded text-xs ${isDark ? 'bg-navy-700 text-blue-300' : 'bg-slate-200 text-blue-700'}`}>.env.local</code>
              {' '}untuk mengaktifkan autentikasi dan sinkronisasi data.
            </p>
          </div>
        )}
      </SettingsSection>

      {/* ---- About ---- */}
      <SettingsSection title="Tentang METRACE" icon={Info} isDark={isDark}>
        <SettingsRow label="Versi" isDark={isDark} control={<span className={`text-sm font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>2.0.0</span>} />
        <SettingsRow label="Fase" isDark={isDark} control={<span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Phase 3 — Core Features & Gamifikasi</span>} />
        <SettingsRow
          label="Tagline"
          isDark={isDark}
          control={<span className={`text-xs italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Your Time. Your Patterns. Your Story.</span>}
        />
      </SettingsSection>

      {/* ---- Logout ---- */}
      <Card className={`overflow-hidden border-red-500/20 ${isDark ? 'bg-red-900/10' : 'bg-red-50/60'}`}>
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className={`text-sm font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>Keluar dari Akun</p>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Sesi akan dihapus dari perangkat ini
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </Card>
    </div>
  );
}
