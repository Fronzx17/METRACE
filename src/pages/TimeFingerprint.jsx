import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Fingerprint, PlusCircle, Loader2, Trophy } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useActivities } from '../hooks/useActivities.js';
import { CATEGORIES, getCat } from '../utils/categories.js';
import { formatDuration, formatDurationShort } from '../utils/helpers.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip,
} from 'recharts';

/* ---- Insight engine (pure JS) ---- */
function generateInsight(topCatId, topPct, totalMin, categoryCount) {
  const insights = {
    belajar: topPct > 50
      ? '📚 Kamu adalah Pelajar Sejati! Lebih dari separuh waktumu diisi dengan belajar. Semangat meraih ilmu!'
      : '📖 Belajar mendominasi aktivitasmu. Kamu sangat berkomitmen pada pengembangan diri!',
    kerja: topPct > 50
      ? '💼 Workaholic Produktif! Kamu sangat fokus pada pekerjaan. Jangan lupa istirahat ya!'
      : '🖥️ Kerja jadi prioritas utamamu. Produktivitas tinggi, tapi tetap jaga keseimbangan hidupmu.',
    olahraga: topPct > 40
      ? '🏃 Atlet Sejati! Kamu sangat rajin berolahraga. Tubuh sehat, pikiran kuat!'
      : '💪 Olahraga sudah jadi gaya hidupmu. Teruskan dan tingkatkan konsistensinya!',
    hiburan: topPct > 50
      ? '🎮 Kamu suka bersenang-senang! Pastikan hiburan tetap seimbang dengan produktivitas ya.'
      : '🎬 Kamu tahu cara menikmati waktu luang. Hiburan yang sehat membuat pikiran lebih segar!',
    istirahat: topPct > 40
      ? '😴 Tubuhmu butuh istirahat cukup — dan kamu memenuhinya! Tidur berkualitas = hidup berkualitas.'
      : '🛌 Kamu memprioritaskan pemulihan. Istirahat yang cukup adalah investasi terbaik untuk produktivitas.',
    sosial: topPct > 40
      ? '👥 Si Kupu-Kupu Sosial! Kamu sangat aktif berinteraksi dengan orang lain. Hubungan sosial yang kuat adalah kunci kebahagiaan.'
      : '🤝 Kamu menjaga hubungan sosial dengan baik. Koneksi yang kuat memberi energi positif!',
    pribadi: topPct > 40
      ? '🧘 Pejuang Self-Care! Kamu meluangkan banyak waktu untuk dirimu sendiri. Keren!'
      : '🌱 Kamu tidak melupakan pengembangan dirimu sendiri. Keseimbangan antara diri dan dunia luar adalah kunci!',
    lainnya: '📌 Aktivitasmu beragam dan tidak terkategori — tandanya hidupmu penuh variasi!',
  };

  if (categoryCount >= 5) {
    return '🌈 Polysection Life! Kamu aktif di banyak kategori. Hidupmu seimbang dan kaya pengalaman!';
  }
  if (totalMin < 60) {
    return '🌱 Baru memulai! Terus rekam aktivitasmu dan lihat polamu berkembang dari waktu ke waktu.';
  }

  return insights[topCatId] || '📊 Terus rekam aktivitasmu untuk mendapatkan insight yang lebih mendalam!';
}

/* ---- Pie label ---- */
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.06) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

/* ---- Empty State ---- */
function EmptyState({ isDark }) {
  return (
    <div className={`rounded-2xl border-2 border-dashed p-14 text-center
      ${isDark ? 'border-blue-800/40 bg-navy-800/40' : 'border-blue-200 bg-blue-50/40'}`}>
      <Fingerprint className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
      <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
        Sidik Jarimu Belum Terbentuk
      </h3>
      <p className={`text-sm mb-6 max-w-xs mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        Rekam setidaknya beberapa aktivitas untuk melihat profil unik pola waktumu!
      </p>
      <Link
        to="/activities"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
      >
        <PlusCircle className="w-4 h-4" />
        Tambah Aktivitas
      </Link>
    </div>
  );
}

export default function TimeFingerprint() {
  const { isDark } = useTheme();
  const { activities, loading } = useActivities();

  const stats = useMemo(() => {
    if (!activities.length) return null;

    const catTotals = {};
    activities.forEach((a) => {
      const cat = (a.category || '').toLowerCase();
      const dur = Number(a.duration) || 0;
      catTotals[cat] = (catTotals[cat] || 0) + dur;
    });

    const totalMin = Object.values(catTotals).reduce((s, v) => s + v, 0);

    const distribution = CATEGORIES
      .map((cat) => ({
        ...cat,
        value: catTotals[cat.id] || 0,
        pct: totalMin > 0 ? Math.round(((catTotals[cat.id] || 0) / totalMin) * 100) : 0,
      }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);

    // Radar data (all 8 categories, normalized 0-100)
    const radarData = CATEGORIES.map((cat) => ({
      subject: cat.label,
      value: totalMin > 0 ? Math.round(((catTotals[cat.id] || 0) / totalMin) * 100) : 0,
      fullMark: 100,
    }));

    const topCat = distribution[0];
    const categoryCount = distribution.length;
    const insight = topCat
      ? generateInsight(topCat.id, topCat.pct, totalMin, categoryCount)
      : null;

    // Fingerprint-style lines per category
    const fingerprintBars = distribution.map((cat, index) => ({
      ...cat,
      segments: Math.max(2, Math.round(cat.pct / 2)),
      index,
    }));

    return { distribution, totalMin, radarData, topCat, insight, fingerprintBars, categoryCount };
  }, [activities]);

  const textMuted = isDark ? '#475569' : '#94a3b8';

  return (
    <div className="space-y-5 animate-slide-up">
      <PageHeader
        title="Time Fingerprint"
        subtitle="Profil unik kebiasaan penggunaan waktumu yang membedakanmu dari orang lain"
        badge="Baru"
      />

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}

      {/* Empty */}
      {!loading && !stats && <EmptyState isDark={isDark} />}

      {/* Main content */}
      {!loading && stats && (
        <>
          {/* Insight Banner */}
          <div className={`rounded-2xl border p-5 relative overflow-hidden
            ${isDark
              ? 'bg-gradient-to-br from-violet-900/30 via-navy-800 to-blue-900/20 border-violet-800/30'
              : 'bg-gradient-to-br from-violet-50 via-white to-blue-50 border-violet-200/60'
            }`}>
            <div className="relative z-10 flex items-start gap-4">
              <div className={`p-3 rounded-xl flex-shrink-0 ${isDark ? 'bg-violet-500/15' : 'bg-violet-100'}`}>
                <Trophy className={`w-6 h-6 ${isDark ? 'text-violet-300' : 'text-violet-600'}`} />
              </div>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>
                  Profil Waktu Kamu
                </p>
                <p className={`text-sm leading-relaxed font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  {stats.insight}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Total terekam: <strong className={isDark ? 'text-white' : 'text-slate-800'}>{formatDuration(stats.totalMin)}</strong>
                  </div>
                  <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Kategori aktif: <strong className={isDark ? 'text-white' : 'text-slate-800'}>{stats.categoryCount}</strong>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-gradient-to-br from-violet-500/10 to-blue-500/10 blur-2xl" />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Radar Chart */}
            <Card className="p-5">
              <h3 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Radar Waktu</h3>
              <p className={`text-xs mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Distribusi persentase antar kategori</p>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={stats.radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke={isDark ? '#1e3a5f' : '#e2e8f0'} />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fontSize: 10, fill: textMuted }}
                  />
                  <Radar
                    dataKey="value"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </Card>

            {/* Pie Chart */}
            <Card className="p-5">
              <h3 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Distribusi Kategori</h3>
              <p className={`text-xs mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Semua waktu terekam per kategori</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={stats.distribution}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    labelLine={false}
                    label={PieLabel}
                  >
                    {stats.distribution.map((entry) => (
                      <Cell key={entry.id} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatDurationShort(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {stats.distribution.map((item) => (
                  <div key={item.id} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.label}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Fingerprint Visualization */}
          <Card className="p-6">
            <h3 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Sidik Jari Waktu</h3>
            <p className={`text-xs mb-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Pola unik berdasarkan distribusi seluruh waktumu yang terekam
            </p>
            <div className="space-y-3">
              {stats.fingerprintBars.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="w-20 text-right flex-shrink-0">
                    <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {item.icon} {item.label}
                    </span>
                  </div>
                  {/* Fingerprint bars */}
                  <div className="flex-1 flex items-center gap-0.5 h-6">
                    {Array.from({ length: 50 }, (_, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm transition-all"
                        style={{
                          height: i < item.segments ? `${60 + Math.sin(i * 0.8 + item.index) * 30}%` : '15%',
                          background: i < item.segments ? item.color : isDark ? '#1e3a5f' : '#e2e8f0',
                          opacity: i < item.segments ? 0.7 + Math.abs(Math.sin(i * 0.5)) * 0.3 : 1,
                        }}
                      />
                    ))}
                  </div>
                  <div className="w-20 text-left flex-shrink-0">
                    <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {formatDurationShort(item.value)}
                    </span>
                    <span className={`text-xs ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {item.pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Progress Bars Breakdown */}
          <Card className="p-5">
            <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Detail Per Kategori</h3>
            <div className="space-y-4">
              {stats.distribution.map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{item.icon}</span>
                      <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {formatDurationShort(item.value)}
                      </span>
                      <span className={`text-xs font-bold w-8 text-right ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {item.pct}%
                      </span>
                    </div>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-navy-700' : 'bg-slate-100'}`}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${item.pct}%`, background: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
