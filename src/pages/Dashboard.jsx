import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useActivities } from '../hooks/useActivities.js';
import { CATEGORIES, getCat, DAYS_ID } from '../utils/categories.js';
import { formatDuration, formatDurationShort, getGreeting, formatDateId } from '../utils/helpers.js';
import {
  Clock, Activity, Flame, TrendingUp, ChevronRight, Zap, PlusCircle, Loader2,
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, Legend,
} from 'recharts';
import StatCard from '../components/ui/StatCard.jsx';
import Card from '../components/ui/Card.jsx';

/* ---- Helpers ---- */
function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/* ---- Custom Tooltip ---- */
function CustomTooltip({ active, payload, label, isDark }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={`rounded-xl border p-3 text-xs shadow-xl ${isDark ? 'bg-navy-800 border-blue-900/40 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}>
      <p className="font-semibold mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color || entry.fill }} />
          <span className="capitalize">{entry.name}:</span>
          <span className="font-semibold">{formatDurationShort(entry.value)}</span>
        </div>
      ))}
    </div>
  );
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
    <div className={`rounded-2xl border-2 border-dashed p-12 text-center
      ${isDark ? 'border-blue-800/40 bg-navy-800/40' : 'border-blue-200 bg-blue-50/40'}`}>
      <div className="text-5xl mb-4">🚀</div>
      <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
        Belum Ada Aktivitas
      </h3>
      <p className={`text-sm mb-6 max-w-xs mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        Mulai rekam aktivitasmu hari ini dan lihat pola penggunaan waktumu berkembang!
      </p>
      <Link
        to="/activities"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
      >
        <PlusCircle className="w-4 h-4" />
        Tambah Aktivitas Pertama
      </Link>
    </div>
  );
}

export default function Dashboard() {
  const { isDark } = useTheme();
  const { user, profile } = useAuth();
  const { activities, loading } = useActivities();

  const today = new Date();
  const textMuted = isDark ? '#475569' : '#94a3b8';

  /* ---- Computed data ---- */
  const stats = useMemo(() => {
    if (!activities.length) return null;

    const monday = getMonday(today);
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return toDateStr(d);
    });

    const thisWeek = activities.filter((a) => weekDates.includes(a.date));
    const totalMinutes = thisWeek.reduce((s, a) => s + (a.duration || 0), 0);
    const totalActivities = thisWeek.length;

    // Category totals (all time)
    const catTotals = {};
    activities.forEach((a) => {
      const cat = (a.category || '').toLowerCase();
      const dur = Number(a.duration) || 0;
      catTotals[cat] = (catTotals[cat] || 0) + dur;
    });
    const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    const topCatId = sortedCats[0]?.[0];
    const topCatMinutes = sortedCats[0]?.[1] || 0;
    const topCat = topCatId ? getCat(topCatId) : null;

    // Weekly chart data: 7 columns, stacked by category
    const weeklyChartData = weekDates.map((dateStr, i) => {
      const dayActs = thisWeek.filter((a) => a.date === dateStr);
      const row = { day: DAYS_ID[(monday.getDay() + i) % 7] || DAYS_ID[i] };
      CATEGORIES.forEach((cat) => {
        row[cat.id] = dayActs
          .filter((a) => (a.category || '').toLowerCase() === cat.id)
          .reduce((s, a) => s + (Number(a.duration) || 0), 0);
      });
      return row;
    });

    // Distribution for pie (all time)
    const distribution = CATEGORIES
      .map((cat) => ({ name: cat.label, id: cat.id, value: catTotals[cat.id] || 0, color: cat.color }))
      .filter((d) => d.value > 0);

    // Recent activities
    const recent = activities.slice(0, 5);

    // Streak: count consecutive days ending today with at least 1 activity
    const dateset = new Set(activities.map((a) => a.date));
    let streak = 0;
    const cur = new Date(today);
    while (true) {
      const ds = toDateStr(cur);
      if (dateset.has(ds)) { streak++; cur.setDate(cur.getDate() - 1); }
      else break;
    }

    return { totalMinutes, totalActivities, topCat, topCatMinutes, weeklyChartData, distribution, recent, streak };
  }, [activities]);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Pengguna';

  /* ---- Active chart bars (only categories with data this week) ---- */
  const activeCatIds = useMemo(() => {
    if (!stats) return [];
    const ids = new Set();
    stats.weeklyChartData.forEach((row) => {
      CATEGORIES.forEach((cat) => { if (row[cat.id] > 0) ids.add(cat.id); });
    });
    return CATEGORIES.filter((c) => ids.has(c.id));
  }, [stats]);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Welcome Section */}
      <div className={`rounded-2xl border p-6 overflow-hidden relative
        ${isDark
          ? 'bg-gradient-to-br from-blue-900/30 via-navy-800 to-violet-900/20 border-blue-800/30'
          : 'bg-gradient-to-br from-blue-50 via-white to-violet-50 border-blue-200/60'
        }`}>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className={`text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>
              {formatDateId(today)}
            </span>
          </div>
          <h2 className={`text-2xl sm:text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {getGreeting()}, <span className="text-gradient">{displayName}!</span> 👋
          </h2>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {loading
              ? 'Memuat data aktivitasmu...'
              : stats
                ? <>Kamu sudah merekam <strong className={isDark ? 'text-white' : 'text-slate-800'}>{stats.totalActivities} aktivitas</strong> minggu ini. Terus pertahankan semangatmu!</>
                : 'Selamat datang! Yuk mulai rekam aktivitas pertamamu hari ini.'
            }
          </p>
          {stats && stats.streak > 0 && (
            <div className="flex items-center gap-4 mt-4">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold
                ${isDark ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                <Flame className="w-3.5 h-3.5" />
                <span>Streak {stats.streak} hari</span>
              </div>
            </div>
          )}
        </div>
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-gradient-to-br from-blue-500/10 to-violet-500/10 blur-2xl" />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}

      {/* Empty State */}
      {!loading && !stats && <EmptyState isDark={isDark} />}

      {/* Stats + Charts — only shown when there's data */}
      {!loading && stats && (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              title="Total Waktu"
              value={formatDuration(stats.totalMinutes)}
              subtitle="Minggu ini"
              icon={Clock}
              iconColor="blue"
              gradient
            />
            <StatCard
              title="Total Aktivitas"
              value={`${stats.totalActivities} Aktivitas`}
              subtitle="Minggu ini"
              icon={Activity}
              iconColor="violet"
            />
            <StatCard
              title="Kategori Terbanyak"
              value={stats.topCat ? `${stats.topCat.icon} ${stats.topCat.label}` : '—'}
              subtitle={stats.topCat ? formatDuration(stats.topCatMinutes) : 'Belum ada data'}
              icon={Flame}
              iconColor="amber"
            />
            <StatCard
              title="Total Terekam"
              value={formatDuration(activities.reduce((s, a) => s + (a.duration || 0), 0))}
              subtitle={`${activities.length} aktivitas total`}
              icon={TrendingUp}
              iconColor="green"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Weekly Bar Chart */}
            <Card className="p-5 xl:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Aktivitas Harian Minggu Ini</h3>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Distribusi waktu per hari (menit)</p>
                </div>
              </div>
              {activeCatIds.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.weeklyChartData} barSize={8} barGap={2}>
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: textMuted }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: textMuted }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip content={(props) => <CustomTooltip {...props} isDark={isDark} />} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
                    {activeCatIds.map((cat) => (
                      <Bar key={cat.id} dataKey={cat.id} fill={cat.color} radius={[4, 4, 0, 0]} name={cat.label} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className={`flex items-center justify-center h-[220px] text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Belum ada aktivitas minggu ini
                </div>
              )}
            </Card>

            {/* Pie Chart */}
            <Card className="p-5">
              <div className="mb-5">
                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Distribusi Waktu</h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Semua waktu per kategori</p>
              </div>
              {stats.distribution.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={stats.distribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        labelLine={false}
                        label={PieLabel}
                      >
                        {stats.distribution.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => formatDurationShort(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-3 grid grid-cols-2 gap-1.5">
                    {stats.distribution.map((item) => (
                      <div key={item.name} className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className={`flex items-center justify-center h-[160px] text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Belum ada data
                </div>
              )}
            </Card>
          </div>

          {/* Recent Activities + Insight */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <Card className="xl:col-span-2 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Aktivitas Terbaru</h3>
                <Link
                  to="/activities"
                  className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="space-y-2">
                {stats.recent.map((act) => {
                  const cat = getCat(act.category);
                  return (
                    <div
                      key={act.id}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-colors
                        ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                    >
                      <span className="text-xl w-8 text-center flex-shrink-0">{cat.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{act.title}</p>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {act.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${cat.color}20`, color: cat.color }}>
                          {cat.label}
                        </span>
                        <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {formatDurationShort(act.duration)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Weekly Insight */}
            <Card className="p-5">
              <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Insight Mingguan</h3>
              {stats.distribution.length > 0 ? (
                <div className="space-y-4">
                  {stats.distribution.map((item) => {
                    const total = stats.distribution.reduce((s, i) => s + i.value, 0);
                    const pct = Math.round((item.value / total) * 100);
                    const cat = getCat(item.id);
                    return (
                      <div key={item.name}>
                        <div className="flex justify-between items-center mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{cat.icon}</span>
                            <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{item.name}</span>
                          </div>
                          <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {formatDurationShort(item.value)} · {pct}%
                          </span>
                        </div>
                        <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-navy-700' : 'bg-slate-100'}`}>
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, background: item.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Belum ada data untuk insight.</p>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
