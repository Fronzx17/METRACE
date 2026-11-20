import React, { useState } from 'react';
import { Compass, Sliders, RotateCcw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell,
} from 'recharts';
import PageHeader from '../components/ui/PageHeader.jsx';
import ComingSoon from '../components/ui/ComingSoon.jsx';
import Card from '../components/ui/Card.jsx';
import { formatDurationShort } from '../utils/helpers.js';

const TOTAL_MINUTES_PER_WEEK = 7 * 16 * 60; // 16 waking hours per day = 6720 minutes/week

const DEFAULT_ALLOCATIONS = {
  belajar: 25,
  kerja: 30,
  olahraga: 10,
  hiburan: 15,
  istirahat: 10,
  sosial: 10,
};

export default function DecisionExplorer() {
  const { isDark } = useTheme();

  // Sliders state (percentage of waking time)
  const [allocations, setAllocations] = useState(DEFAULT_ALLOCATIONS);

  const totalPct = Object.values(allocations).reduce((s, v) => s + v, 0);

  const colors = {
    belajar: '#3b82f6',
    kerja: '#8b5cf6',
    olahraga: '#10b981',
    hiburan: '#f59e0b',
    istirahat: '#06b6d4',
    sosial: '#ec4899',
  };

  const labels = {
    belajar: 'Belajar',
    kerja: 'Kerja',
    olahraga: 'Olahraga',
    hiburan: 'Hiburan',
    istirahat: 'Istirahat',
    sosial: 'Sosial',
  };

  const chartData = Object.entries(allocations).map(([key, pct]) => ({
    name: labels[key],
    menit: Math.round((pct / 100) * TOTAL_MINUTES_PER_WEEK),
    color: colors[key],
  }));

  const textMuted = isDark ? '#475569' : '#94a3b8';

  const handleReset = () => {
    setAllocations(DEFAULT_ALLOCATIONS);
  };

  return (
    <div className="space-y-5 animate-slide-up">
      <PageHeader
        title="Decision Explorer"
        subtitle="Simulasikan alokasi waktumu yang ideal dan lihat proyeksi mingguan"
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Sliders */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Atur Alokasi Waktu</h3>
            </div>
            <button
              onClick={handleReset}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                isDark
                  ? 'border-blue-900/40 text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  : 'border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          <p className={`text-xs mb-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Geser slider untuk mensimulasikan persentase waktu bangun mingguan (asumsi 16 jam/hari). Total saat ini:{' '}
            <span className={totalPct > 100 ? 'text-red-400 font-bold' : totalPct === 100 ? 'text-emerald-400 font-bold' : 'text-blue-400 font-bold'}>
              {totalPct}%
            </span>
            {totalPct > 100 && ' (melebihi 100%!)'}
            {totalPct === 100 && ' (tepat 100% ✓)'}
          </p>

          <div className="space-y-5">
            {Object.entries(allocations).map(([key, val]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{labels[key]}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold" style={{ color: colors[key] }}>{val}%</span>
                    <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      · {formatDurationShort(Math.round((val / 100) * TOTAL_MINUTES_PER_WEEK))}
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={60}
                  value={val}
                  onChange={(e) => setAllocations((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-slate-200 dark:bg-navy-700"
                  style={{ accentColor: colors[key] }}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Result chart */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <h3 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Proyeksi Mingguan</h3>
            <p className={`text-xs mb-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Estimasi total jam dan menit per kategori berdasarkan simulasi alokasi yang kamu atur
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} barSize={28}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: textMuted }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: textMuted }}
                  axisLine={false}
                  tickLine={false}
                  width={45}
                  tickFormatter={(v) => `${Math.round(v / 60)}j`}
                />
                <Tooltip
                  formatter={(v) => [formatDurationShort(v), 'Waktu']}
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="menit" radius={[6, 6, 0, 0]} name="Waktu">
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={`mt-4 p-3 rounded-xl border text-xs ${isDark ? 'bg-navy-900/60 border-blue-900/30 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
            💡 <strong>Insight Simulasi:</strong> Jika kamu mengalokasikan {allocations.belajar}% untuk Belajar dan {allocations.kerja}% untuk Kerja, kamu memiliki {(allocations.belajar + allocations.kerja)}% waktu untuk produktivitas utama per minggu.
          </div>
        </Card>
      </div>

      <ComingSoon
        feature="Simulasi Dampak & Rekomendasi AI"
        description="Fitur cerdas untuk memprediksi dampak perubahan alokasi waktu terhadap produktivitas dan keseimbangan hidupmu."
        icon={Compass}
      />
    </div>
  );
}
