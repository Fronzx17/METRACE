import React, { useMemo } from 'react';
import { Trophy, Lock, CheckCircle2, Clock, Loader2, Sparkles, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useActivities } from '../hooks/useActivities.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';

function ChallengeCard({ challenge, isDark }) {
  const pct = Math.min(100, Math.round((challenge.progress / challenge.total) * 100));
  const isCompleted = challenge.status === 'completed';
  const isLocked = challenge.status === 'locked';

  return (
    <div className={`rounded-2xl border p-5 transition-all duration-200
      ${isLocked
        ? isDark ? 'bg-navy-900/60 border-blue-900/20 opacity-60' : 'bg-slate-50 border-slate-200 opacity-60'
        : isCompleted
          ? isDark ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
          : isDark ? 'bg-navy-800 border-blue-900/40 hover:border-blue-500/40' : 'bg-white border-slate-200 hover:border-blue-300'
       }
    `}>
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: `${challenge.color}20` }}
        >
          {isLocked ? <Lock className="w-5 h-5 text-slate-500" /> : challenge.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{challenge.title}</h4>
            <div className="flex items-center gap-1 flex-shrink-0">
              {isCompleted ? (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                </span>
              ) : isLocked ? (
                <Lock className="w-4 h-4 text-slate-500" />
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                  <Clock className="w-3.5 h-3.5" /> Berjalan
                </span>
              )}
            </div>
          </div>
          <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{challenge.description}</p>

          {/* Progress bar */}
          <div className="mt-3.5">
            <div className="flex justify-between items-center mb-1.5">
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {challenge.progress}/{challenge.total} {challenge.unit}
              </span>
              <span className="text-xs font-semibold" style={{ color: isCompleted ? '#10b981' : challenge.color }}>
                {pct}%
              </span>
            </div>
            <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-navy-700' : 'bg-slate-100'}`}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: isCompleted ? '#10b981' : challenge.color }}
              />
            </div>
          </div>

          {/* Reward */}
          <div className="flex items-center gap-1.5 mt-3">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400">+{challenge.reward} poin</span>
            {isCompleted && (
              <span className="text-[11px] text-emerald-400 ml-auto font-medium">Diperoleh ✓</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Challenges() {
  const { isDark } = useTheme();
  const { activities, loading } = useActivities();

  // Compute challenges dynamically from real user activity data
  const { challenges, earnedPoints, totalAvailablePoints } = useMemo(() => {
    // 1. Group minutes per date and per category
    const dateMap = {}; // date -> total min
    const dateCatMap = {}; // date -> { cat: min }
    const dateBelajarMap = {};
    const dateOlahragaMap = {};
    const uniqueCats = new Set();
    let deepWorkSessions = 0;
    let kerjaBelajarSessions = 0;

    activities.forEach((act) => {
      const d = act.date;
      const cat = (act.category || '').toLowerCase();
      const dur = Number(act.duration) || 0;

      uniqueCats.add(cat);

      if (d) {
        dateMap[d] = (dateMap[d] || 0) + dur;
        if (!dateCatMap[d]) dateCatMap[d] = new Set();
        dateCatMap[d].add(cat);

        if (cat === 'belajar') {
          dateBelajarMap[d] = (dateBelajarMap[d] || 0) + dur;
        }
        if (cat === 'olahraga') {
          dateOlahragaMap[d] = (dateOlahragaMap[d] || 0) + dur;
        }
      }

      if ((cat === 'kerja' || cat === 'belajar') && dur >= 60) {
        deepWorkSessions++;
      }
      if (cat === 'kerja' || cat === 'belajar') {
        kerjaBelajarSessions++;
      }
    });

    const uniqueDatesCount = Object.keys(dateMap).length;
    const belajarDaysCount = Object.values(dateBelajarMap).filter((m) => m >= 60).length;
    const olahragaDaysCount = Object.values(dateOlahragaMap).filter((m) => m >= 30).length;
    const balancedDaysCount = Object.values(dateCatMap).filter((cats) => cats.size >= 3).length;

    const definitions = [
      {
        id: 1,
        title: 'Fokus Belajar',
        description: 'Rekam minimal 60 menit belajar dalam sehari sebanyak 5 hari.',
        category: 'belajar',
        icon: '📚',
        color: '#3b82f6',
        progress: belajarDaysCount,
        total: 5,
        unit: 'hari',
        reward: 150,
      },
      {
        id: 2,
        title: 'Rutinitas Bugar',
        description: 'Lakukan olahraga minimal 30 menit dalam sehari sebanyak 3 hari.',
        category: 'olahraga',
        icon: '🏃',
        color: '#10b981',
        progress: olahragaDaysCount,
        total: 3,
        unit: 'hari',
        reward: 100,
      },
      {
        id: 3,
        title: 'Pekan Produktif',
        description: 'Rekam minimal 5 sesi kerja atau belajar.',
        category: 'kerja',
        icon: '💼',
        color: '#8b5cf6',
        progress: kerjaBelajarSessions,
        total: 5,
        unit: 'sesi',
        reward: 120,
      },
      {
        id: 4,
        title: 'Hari Seimbang',
        description: 'Catat minimal 3 kategori aktivitas berbeda dalam hari yang sama.',
        category: 'all',
        icon: '⚖️',
        color: '#f59e0b',
        progress: balancedDaysCount,
        total: 2,
        unit: 'hari',
        reward: 180,
      },
      {
        id: 5,
        title: 'Pencatat Rutin',
        description: 'Catat aktivitas produktif di 5 tanggal berbeda.',
        category: 'all',
        icon: '📅',
        color: '#06b6d4',
        progress: uniqueDatesCount,
        total: 5,
        unit: 'hari',
        reward: 200,
      },
      {
        id: 6,
        title: 'Eksplorasi Kategori',
        description: 'Gunakan minimal 4 kategori aktivitas yang berbeda.',
        category: 'all',
        icon: '🌈',
        color: '#ec4899',
        progress: uniqueCats.size,
        total: 4,
        unit: 'kategori',
        reward: 160,
      },
    ];

    const computedList = definitions.map((c) => {
      const isCompleted = c.progress >= c.total;
      return {
        ...c,
        status: isCompleted ? 'completed' : 'active',
      };
    });

    const earned = computedList
      .filter((c) => c.status === 'completed')
      .reduce((sum, c) => sum + c.reward, 0);

    const totalAvailable = computedList.reduce((sum, c) => sum + c.reward, 0);

    return {
      challenges: computedList,
      earnedPoints: earned,
      totalAvailablePoints: totalAvailable,
    };
  }, [activities]);

  const active = challenges.filter((c) => c.status === 'active');
  const completed = challenges.filter((c) => c.status === 'completed');

  if (loading) {
    return (
      <div className="space-y-5 animate-slide-up">
        <PageHeader title="Tantangan" subtitle="Capai target waktumu untuk mendapatkan poin" />
        <div className="flex flex-col items-center justify-center p-16 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Menghitung progres tantangan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <PageHeader
        title="Tantangan"
        subtitle="Selesaikan tantangan berbasis data aktivitas nyatamu untuk mengumpulkan poin"
      />

      {/* Point highlight banner */}
      <Card className="p-5 overflow-hidden relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Poin Terkumpul</p>
              <p className="text-2xl font-bold text-amber-400">{earnedPoints} <span className="text-sm font-normal text-slate-400">/ {totalAvailablePoints} poin</span></p>
            </div>
          </div>
          <div className="text-right sm:text-right w-full sm:w-auto">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
              {completed.length} dari {challenges.length} Tantangan Selesai
            </span>
          </div>
        </div>
      </Card>

      {/* Summary Counters */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Sedang Berjalan', value: active.length, color: 'text-blue-400', bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50' },
          { label: 'Selesai', value: completed.length, color: 'text-emerald-400', bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50' },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl p-4 text-center ${s.bg} border ${isDark ? 'border-white/5' : 'border-transparent'}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {activities.length === 0 && (
        <div className={`rounded-2xl border-2 border-dashed p-8 text-center ${isDark ? 'border-blue-900/40 bg-navy-800/40' : 'border-blue-200 bg-blue-50/40'}`}>
          <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <h4 className={`text-sm font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Mulai Tantangan Pertamamu!</h4>
          <p className={`text-xs max-w-sm mx-auto mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Tantangan akan terisi otomatis seiring dengan aktivitas yang kamu tambahkan di halaman Aktivitas.
          </p>
          <Link to="/activities" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold">
            <PlusCircle className="w-3.5 h-3.5" /> Tambah Aktivitas Sekarang
          </Link>
        </div>
      )}

      {/* Active Challenges */}
      {active.length > 0 && (
        <div>
          <h3 className={`text-sm font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Sedang Berjalan ({active.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {active.map((c) => <ChallengeCard key={c.id} challenge={c} isDark={isDark} />)}
          </div>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <h3 className={`text-sm font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Telah Selesai ({completed.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {completed.map((c) => <ChallengeCard key={c.id} challenge={c} isDark={isDark} />)}
          </div>
        </div>
      )}
    </div>
  );
}
