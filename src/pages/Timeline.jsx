import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useActivities } from '../hooks/useActivities.js';
import { getCat } from '../utils/categories.js';
import { formatDurationShort, formatDateId } from '../utils/helpers.js';
import { CalendarDays, ChevronLeft, ChevronRight, PlusCircle, Loader2, Clock } from 'lucide-react';
import Card from '../components/ui/Card.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';

/* ---- Helpers ---- */
function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatWeekRange(monday) {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const opts = { day: 'numeric', month: 'short' };
  const start = monday.toLocaleDateString('id-ID', opts);
  const end = sunday.toLocaleDateString('id-ID', { ...opts, year: 'numeric' });
  return `${start} – ${end}`;
}

/* ---- Activity Row ---- */
function ActivityRow({ act, isDark }) {
  const cat = getCat(act.category);
  return (
    <div className={`flex items-center gap-4 p-3 rounded-xl transition-colors
      ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
      <span className="text-xl w-8 text-center flex-shrink-0">{cat.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{act.title}</p>
        {act.notes && (
          <p className={`text-xs truncate mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{act.notes}</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
          style={{ background: `${cat.color}20`, color: cat.color }}
        >
          {cat.label}
        </span>
        <span className={`text-xs font-semibold flex items-center gap-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          <Clock className="w-3 h-3 opacity-60" />
          {formatDurationShort(act.duration)}
        </span>
      </div>
    </div>
  );
}

/* ---- Day Card ---- */
function DayCard({ dateStr, dayActivities, isDark }) {
  const date = new Date(dateStr + 'T00:00:00');
  const totalMin = dayActivities.reduce((s, a) => s + (a.duration || 0), 0);
  const dayLabel = date.toLocaleDateString('id-ID', { weekday: 'long' });
  const dateLabel = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Card className="overflow-hidden">
      {/* Date header */}
      <div className={`px-5 py-3 flex items-center justify-between border-b
        ${isDark ? 'border-blue-900/30 bg-navy-900/40' : 'border-slate-100 bg-slate-50/80'}`}>
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{dayLabel}</p>
          <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{dateLabel}</p>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full
          ${isDark ? 'bg-blue-500/15 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
          <Clock className="w-3 h-3" />
          {formatDurationShort(totalMin)}
        </div>
      </div>
      {/* Activities */}
      <div className="px-2 py-2 space-y-0.5">
        {dayActivities.map((act) => (
          <ActivityRow key={act.id} act={act} isDark={isDark} />
        ))}
      </div>
    </Card>
  );
}

/* ---- Empty State ---- */
function EmptyWeek({ isDark }) {
  return (
    <div className={`rounded-2xl border-2 border-dashed p-10 text-center
      ${isDark ? 'border-blue-800/40 bg-navy-800/40' : 'border-blue-200 bg-blue-50/40'}`}>
      <CalendarDays className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
      <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
        Tidak ada aktivitas minggu ini
      </p>
      <p className={`text-xs mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        Navigasi ke minggu lain atau tambah aktivitas baru.
      </p>
      <Link
        to="/activities"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
      >
        <PlusCircle className="w-4 h-4" />
        Tambah Aktivitas
      </Link>
    </div>
  );
}

export default function Timeline() {
  const { isDark } = useTheme();
  const { activities, loading } = useActivities();

  // Current week offset (0 = this week, -1 = last week, etc.)
  const [weekOffset, setWeekOffset] = useState(0);

  const { weekDates, groupedByDate, weekHasData, weekTotalMin } = useMemo(() => {
    const baseMonday = getMonday(new Date());
    const monday = new Date(baseMonday);
    monday.setDate(baseMonday.getDate() + weekOffset * 7);

    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return toDateStr(d);
    });

    const grouped = {};
    weekDates.forEach((ds) => { grouped[ds] = []; });
    activities.forEach((a) => {
      if (grouped[a.date] !== undefined) {
        grouped[a.date].push(a);
      }
    });

    const weekHasData = weekDates.some((ds) => grouped[ds].length > 0);
    const weekTotalMin = weekDates.reduce((s, ds) =>
      s + grouped[ds].reduce((ss, a) => ss + (a.duration || 0), 0), 0);

    return { weekDates, groupedByDate: grouped, weekHasData, weekTotalMin };
  }, [activities, weekOffset]);

  const isCurrentWeek = weekOffset === 0;
  const currentMonday = useMemo(() => {
    const base = getMonday(new Date());
    base.setDate(base.getDate() + weekOffset * 7);
    return base;
  }, [weekOffset]);

  return (
    <div className="space-y-5 animate-slide-up">
      <PageHeader
        title="Timeline"
        subtitle="Riwayat aktivitasmu dikelompokkan per hari"
      />

      {/* Week Navigator */}
      <div className={`flex items-center justify-between rounded-2xl border p-4
        ${isDark ? 'bg-navy-800 border-blue-900/30' : 'bg-white border-slate-200'}`}>
        <button
          onClick={() => setWeekOffset((o) => o - 1)}
          className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`}
          title="Minggu sebelumnya"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {isCurrentWeek ? '📅 Minggu Ini' : formatWeekRange(currentMonday)}
          </p>
          {!isCurrentWeek && (
            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {formatWeekRange(currentMonday)}
            </p>
          )}
          {isCurrentWeek && (
            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {formatWeekRange(currentMonday)}
            </p>
          )}
          {weekHasData && (
            <p className={`text-xs font-semibold mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              Total: {formatDurationShort(weekTotalMin)}
            </p>
          )}
        </div>

        <button
          onClick={() => setWeekOffset((o) => Math.min(o + 1, 0))}
          disabled={isCurrentWeek}
          className={`p-2 rounded-xl transition-colors
            ${isCurrentWeek
              ? 'opacity-30 cursor-not-allowed'
              : isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
            }`}
          title="Minggu berikutnya"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}

      {/* Content */}
      {!loading && (
        weekHasData
          ? (
            <div className="space-y-4">
              {weekDates
                .filter((ds) => groupedByDate[ds].length > 0)
                .map((ds) => (
                  <DayCard
                    key={ds}
                    dateStr={ds}
                    dayActivities={groupedByDate[ds]}
                    isDark={isDark}
                  />
                ))
              }
            </div>
          )
          : <EmptyWeek isDark={isDark} />
      )}
    </div>
  );
}
