import React, { useMemo } from 'react';
import { Star, Lock, CheckCircle2, Loader2, Sparkles, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useActivities } from '../hooks/useActivities.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';

function AchievementCard({ ach, isDark }) {
  return (
    <div className={`rounded-2xl border p-4 text-center flex flex-col items-center gap-2.5 transition-all duration-200
      ${ach.earned
        ? isDark
          ? 'bg-navy-800 border-blue-900/40 hover:border-blue-500/40'
          : 'bg-white border-slate-200 hover:border-blue-300'
        : isDark
          ? 'bg-navy-900/50 border-blue-900/20 opacity-50'
          : 'bg-slate-50 border-slate-100 opacity-50'
      }`}>
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform hover:scale-105"
        style={{ background: ach.earned ? `${ach.color}20` : isDark ? '#1e3a5f30' : '#f1f5f9' }}
      >
        {ach.earned ? ach.icon : <Lock className="w-5 h-5 text-slate-500" />}
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{ach.title}</p>
          <p className={`text-xs mt-0.5 leading-snug ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{ach.desc}</p>
        </div>
        <p className={`text-[10px] mt-2 font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Progres: {ach.progress}
        </p>
      </div>
      {ach.earned ? (
        <span className="badge text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-semibold">
          Diraih ✓
        </span>
      ) : (
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${isDark ? 'bg-navy-700 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>
          Terkunci
        </span>
      )}
    </div>
  );
}

export default function Achievements() {
  const { isDark } = useTheme();
  const { activities, loading } = useActivities();

  // Compute achievements dynamically from user's activities
  const achievements = useMemo(() => {
    const totalCount = activities.length;
    const totalDuration = activities.reduce((sum, a) => sum + (Number(a.duration) || 0), 0);
    const uniqueDates = new Set(activities.map((a) => a.date).filter(Boolean));
    const uniqueCats = new Set(activities.map((a) => (a.category || '').toLowerCase()).filter(Boolean));

    const totalBelajar = activities
      .filter((a) => (a.category || '').toLowerCase() === 'belajar')
      .reduce((sum, a) => sum + (Number(a.duration) || 0), 0);

    const totalKerja = activities
      .filter((a) => (a.category || '').toLowerCase() === 'kerja')
      .reduce((sum, a) => sum + (Number(a.duration) || 0), 0);

    const hasOlahraga = activities.some((a) => (a.category || '').toLowerCase() === 'olahraga');

    const earliestActivity = [...activities].sort((a, b) => (a.date || '').localeCompare(b.date || ''))[0];

    const list = [
      {
        id: 1,
        title: 'Pemula Produktif',
        desc: 'Rekam aktivitas pertamamu di METRACE',
        icon: '🌱',
        color: '#10b981',
        earned: totalCount >= 1,
        progress: `${Math.min(totalCount, 1)}/1 aktivitas`,
        date: earliestActivity?.date || null,
      },
      {
        id: 2,
        title: 'Penjelajah Waktu',
        desc: 'Catat minimal 5 aktivitas di METRACE',
        icon: '🧭',
        color: '#f59e0b',
        earned: totalCount >= 5,
        progress: `${Math.min(totalCount, 5)}/5 aktivitas`,
      },
      {
        id: 3,
        title: 'Konsistensi Teruji',
        desc: 'Catat aktivitas di minimal 3 hari berbeda',
        icon: '🔥',
        color: '#ef4444',
        earned: uniqueDates.size >= 3,
        progress: `${Math.min(uniqueDates.size, 3)}/3 hari`,
      },
      {
        id: 4,
        title: 'Kutu Buku',
        desc: 'Akumulasi waktu belajar minimal 2 jam (120 menit)',
        icon: '📚',
        color: '#3b82f6',
        earned: totalBelajar >= 120,
        progress: `${Math.min(totalBelajar, 120)}/120 menit`,
      },
      {
        id: 5,
        title: 'Pekerja Keras',
        desc: 'Akumulasi waktu kerja minimal 3 jam (180 menit)',
        icon: '💪',
        color: '#f97316',
        earned: totalKerja >= 180,
        progress: `${Math.min(totalKerja, 180)}/180 menit`,
      },
      {
        id: 6,
        title: 'Jiwa Bugar',
        desc: 'Rekam setidaknya 1 aktivitas olahraga',
        icon: '🏃',
        color: '#06b6d4',
        earned: hasOlahraga,
        progress: hasOlahraga ? '1/1 aktivitas' : '0/1 aktivitas',
      },
      {
        id: 7,
        title: 'Master Keseimbangan',
        desc: 'Gunakan minimal 4 kategori aktivitas berbeda',
        icon: '⚖️',
        color: '#8b5cf6',
        earned: uniqueCats.size >= 4,
        progress: `${Math.min(uniqueCats.size, 4)}/4 kategori`,
      },
      {
        id: 8,
        title: 'Dedikasi Tinggi',
        desc: 'Total durasi seluruh aktivitas mencapai 10 jam (600 menit)',
        icon: '⚡',
        color: '#ec4899',
        earned: totalDuration >= 600,
        progress: `${Math.min(totalDuration, 600)}/600 menit`,
      },
    ];

    return list;
  }, [activities]);

  const earned = achievements.filter((a) => a.earned);
  const locked = achievements.filter((a) => !a.earned);

  if (loading) {
    return (
      <div className="space-y-5 animate-slide-up">
        <PageHeader title="Pencapaian" subtitle="Koleksi badge dan penghargaan dari perjalanan produktivitasmu" />
        <div className="flex flex-col items-center justify-center p-16 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Memuat data pencapaian...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <PageHeader
        title="Pencapaian"
        subtitle="Koleksi badge dan penghargaan dari perjalanan produktivitasmu"
      />

      {/* Stats Card */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-2 shadow-glow-blue">
              <Star className="w-8 h-8 text-white" />
            </div>
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{earned.length}</p>
            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Badge Diraih</p>
          </div>
          <div className={`flex-1 h-px sm:h-auto sm:w-px ${isDark ? 'bg-blue-900/40' : 'bg-slate-200'}`} />
          <div className="flex-1 w-full">
            <div className="flex justify-between mb-2">
              <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Progress Koleksi
              </span>
              <span className="text-sm font-bold text-blue-400">
                {earned.length}/{achievements.length} Badge ({Math.round((earned.length / achievements.length) * 100)}%)
              </span>
            </div>
            <div className={`h-3 rounded-full overflow-hidden ${isDark ? 'bg-navy-700' : 'bg-slate-100'}`}>
              <div
                className="h-full rounded-full bg-gradient-brand transition-all duration-500"
                style={{ width: `${(earned.length / achievements.length) * 100}%` }}
              />
            </div>
            <p className={`text-xs mt-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {achievements.length - earned.length === 0
                ? 'Luar biasa! Semua badge berhasil kamu kumpulkan!'
                : `${achievements.length - earned.length} badge lagi untuk dilengkapi.`}
            </p>
          </div>
        </div>
      </Card>

      {activities.length === 0 && (
        <div className={`rounded-2xl border-2 border-dashed p-8 text-center ${isDark ? 'border-blue-900/40 bg-navy-800/40' : 'border-blue-200 bg-blue-50/40'}`}>
          <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <h4 className={`text-sm font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Belum Ada Badge Terbuka</h4>
          <p className={`text-xs max-w-sm mx-auto mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Badge akan terbuka secara otomatis seiring dengan bertambahnya aktivitas yang kamu rekam.
          </p>
          <Link to="/activities" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold">
            <PlusCircle className="w-3.5 h-3.5" /> Rekam Aktivitas Sekarang
          </Link>
        </div>
      )}

      {/* Earned */}
      {earned.length > 0 && (
        <div>
          <h3 className={`text-sm font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Badge Diraih ({earned.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {earned.map((a) => <AchievementCard key={a.id} ach={a} isDark={isDark} />)}
          </div>
        </div>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <div>
          <h3 className={`text-sm font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Belum Diraih ({locked.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {locked.map((a) => <AchievementCard key={a.id} ach={a} isDark={isDark} />)}
          </div>
        </div>
      )}
    </div>
  );
}
