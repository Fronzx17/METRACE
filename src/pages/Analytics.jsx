import React, { useMemo, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useActivities } from '../hooks/useActivities.js';
import { CATEGORIES, getCat, DAYS_ID } from '../utils/categories.js';
import { formatDurationShort } from '../utils/helpers.js';
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Cell,
} from 'recharts';
import Card from '../components/ui/Card.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import { Loader2, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const TABS = ['Mingguan', 'Kategori', 'Radar'];

function CustomTooltip({ active, payload, label, isDark }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={`rounded-xl border p-3 text-xs shadow-xl ${isDark ? 'bg-navy-800 border-blue-900/40 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}>
      <p className="font-semibold mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color || entry.fill }} />
          <span>{entry.name}:</span>
          <span className="font-semibold">{formatDurationShort(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}
function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function EmptyState({ isDark }) {
  return (
    <div className={`rounded-2xl border-2 border-dashed p-14 text-center ${isDark ? 'border-blue-800/40 bg-navy-800/40' : 'border-blue-200 bg-blue-50/40'}`}>
      <div className="text-5xl mb-4">📊</div>
      <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Belum Ada Data Analitik</h3>
      <p className={`text-sm mb-6 max-w-xs mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        Tambah beberapa aktivitas terlebih dahulu agar grafik analitikmu tampil di sini.
      </p>
      <Link to="/activities" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
        <PlusCircle className="w-4 h-4" /> Tambah Aktivitas
      </Link>
    </div>
  );
}

export default function Analytics() {
  const { isDark } = useTheme();
  const { activities, loading } = useActivities();
  const [activeTab, setActiveTab] = useState(0);

  const textMuted = isDark ? '#475569' : '#94a3b8';
  const gridColor = isDark ? '#1e3a5f30' : '#e2e8f060';

  const tabBtnClass = (i) =>
    `px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200
     ${activeTab === i
      ? 'bg-gradient-brand text-white shadow-glow-blue'
      : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
     }`;

  /* ---- Computed analytics data ---- */
  const analytics = useMemo(() => {
    if (!activities.length) return null;

    const monday = getMonday(new Date());
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return toDateStr(d);
    });
    const thisWeek = activities.filter((a) => weekDates.includes(a.date));

    // Weekly area chart data (7 days × categories)
    const weeklyData = weekDates.map((ds, i) => {
      const dayActs = thisWeek.filter((a) => a.date === ds);
      const row = { day: DAYS_ID[(monday.getDay() + i) % 7] || DAYS_ID[i] };
      CATEGORIES.forEach((cat) => {
        row[cat.id] = dayActs
          .filter((a) => (a.category || '').toLowerCase() === cat.id)
          .reduce((s, a) => s + (Number(a.duration) || 0), 0);
      });
      return row;
    });

    // Category totals (all time) for bar chart
    const catTotals = {};
    activities.forEach((a) => {
      const cat = (a.category || '').toLowerCase();
      const dur = Number(a.duration) || 0;
      catTotals[cat] = (catTotals[cat] || 0) + dur;
    });
    const distribution = CATEGORIES
      .map((cat) => ({ name: cat.label, id: cat.id, value: catTotals[cat.id] || 0, color: cat.color }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);

    // Radar data (all categories, % of total)
    const totalMin = Object.values(catTotals).reduce((s, v) => s + v, 0);
    const radarData = CATEGORIES.map((cat) => ({
      subject: cat.label,
      value: totalMin > 0 ? Math.round(((catTotals[cat.id] || 0) / totalMin) * 100) : 0,
      fullMark: 100,
    }));

    // Active categories this week (for area chart legend)
    const activeWeekCats = CATEGORIES.filter((cat) =>
      weeklyData.some((row) => (row[cat.id] || 0) > 0)
    );

    return { weeklyData, distribution, radarData, activeWeekCats, totalMin };
  }, [activities]);

  return (
    <div className="space-y-5 animate-slide-up">
      <PageHeader title="Analitik" subtitle="Pola dan tren mendalam dari penggunaan waktumu" />

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}

      {/* Empty */}
      {!loading && !analytics && <EmptyState isDark={isDark} />}

      {/* Content */}
      {!loading && analytics && (
        <>
          {/* Tab switcher */}
          <div className={`flex gap-1.5 p-1 rounded-2xl w-fit ${isDark ? 'bg-navy-800 border border-blue-900/40' : 'bg-slate-100 border border-slate-200'}`}>
            {TABS.map((tab, i) => (
              <button key={tab} className={tabBtnClass(i)} onClick={() => setActiveTab(i)}>{tab}</button>
            ))}
          </div>

          {/* Tab: Mingguan — Area chart */}
          {activeTab === 0 && (
            <Card className="p-5">
              <h3 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Tren Aktivitas Mingguan</h3>
              <p className={`text-xs mb-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Jumlah menit per kategori per hari (minggu ini)</p>
              {analytics.activeWeekCats.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={analytics.weeklyData}>
                    <defs>
                      {analytics.activeWeekCats.map((cat) => (
                        <linearGradient key={cat.id} id={`grad-${cat.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={cat.color} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={cat.color} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid stroke={gridColor} strokeDasharray="4 4" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: textMuted }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: textMuted }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip content={(p) => <CustomTooltip {...p} isDark={isDark} />} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
                    {analytics.activeWeekCats.map((cat) => (
                      <Area
                        key={cat.id}
                        type="monotone"
                        dataKey={cat.id}
                        stroke={cat.color}
                        fill={`url(#grad-${cat.id})`}
                        strokeWidth={2}
                        name={cat.label}
                        dot={{ r: 3, fill: cat.color }}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className={`flex items-center justify-center h-[320px] text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Belum ada aktivitas minggu ini
                </div>
              )}
            </Card>
          )}

          {/* Tab: Kategori — Horizontal Bar chart */}
          {activeTab === 1 && (
            <Card className="p-5">
              <h3 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Total Waktu per Kategori</h3>
              <p className={`text-xs mb-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Semua waktu terekam per kategori (semua waktu)</p>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={analytics.distribution} layout="vertical">
                  <CartesianGrid stroke={gridColor} strokeDasharray="4 4" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: textMuted }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.floor(v / 60)}j`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: textMuted }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip formatter={(v) => formatDurationShort(v)} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} name="Durasi">
                    {analytics.distribution.map((entry) => (
                      <Cell key={entry.id} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Tab: Radar */}
          {activeTab === 2 && (
            <Card className="p-5">
              <h3 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Radar Keseimbangan Waktu</h3>
              <p className={`text-xs mb-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Distribusi persentase antar dimensi kehidupan</p>
              <ResponsiveContainer width="100%" height={340}>
                <RadarChart data={analytics.radarData} cx="50%" cy="50%" outerRadius={120}>
                  <PolarGrid stroke={isDark ? '#1e3a5f' : '#e2e8f0'} />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: textMuted }} />
                  <Radar name="Persentase (%)" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} strokeWidth={2} />
                  <Tooltip formatter={(v) => `${v}%`} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Summary cards — top 3 categories */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {analytics.distribution.slice(0, 3).map((item) => {
              const cat = getCat(item.id);
              return (
                <Card key={item.id} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{cat.icon}</span>
                    <p className={`text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.name}</p>
                  </div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatDurationShort(item.value)}</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {Math.round((item.value / analytics.totalMin) * 100)}% dari total waktu
                  </p>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
