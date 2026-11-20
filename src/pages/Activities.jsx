import React, { useState } from 'react';
import { Plus, Search, Filter, Clock, Pencil, Trash2, AlertTriangle, Loader2, CalendarDays, RefreshCw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useActivities } from '../hooks/useActivities.js';
import { CATEGORIES, getCat } from '../utils/categories.js';
import { formatDurationShort } from '../utils/helpers.js';
import Card from '../components/ui/Card.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import ActivityModal from '../components/ui/ActivityModal.jsx';

/* ---- Delete confirmation dialog ---- */
function DeleteConfirm({ title, onConfirm, onCancel, isDark }) {
  const [deleting, setDeleting] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-sm rounded-2xl border p-6 shadow-2xl ${isDark ? 'bg-navy-800 border-blue-900/40' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-col items-center text-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/25 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Hapus Aktivitas?</p>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              "<span className="font-medium">{title}</span>" akan dihapus permanen.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors
            ${isDark ? 'border-blue-900/40 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            Batal
          </button>
          <button
            disabled={deleting}
            onClick={async () => { setDeleting(true); await onConfirm(); }}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- Toast notification ---- */
function Toast({ message, type, isDark }) {
  const bg = type === 'error'
    ? 'bg-red-500/15 border-red-500/25 text-red-400'
    : 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400';
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border text-sm font-medium shadow-xl animate-slide-up ${bg}`}>
      {message}
    </div>
  );
}

export default function Activities() {
  const { isDark } = useTheme();
  const { activities, loading, error, addActivity, updateActivity, deleteActivity, refetch } = useActivities();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | activity object (edit)
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ---- Filter ---- */
  const filtered = activities.filter((a) => {
    const ms = a.title.toLowerCase().includes(search.toLowerCase()) ||
                (a.notes || '').toLowerCase().includes(search.toLowerCase());
    const mc = selectedCat === 'all' || a.category === selectedCat;
    const md = !selectedDate || a.date === selectedDate;
    return ms && mc && md;
  });

  /* ---- Handlers ---- */
  const handleSave = async (payload) => {
    if (typeof modal === 'object' && modal?.id) {
      const { error: err } = await updateActivity(modal.id, payload);
      if (!err) showToast('Aktivitas berhasil diperbarui ✓');
      return { error: err };
    } else {
      const { error: err } = await addActivity(payload);
      if (!err) showToast('Aktivitas berhasil ditambahkan ✓');
      return { error: err };
    }
  };

  const handleDelete = async () => {
    const { error: err } = await deleteActivity(deleteTarget.id);
    setDeleteTarget(null);
    if (err) showToast('Gagal menghapus aktivitas.', 'error');
    else showToast('Aktivitas berhasil dihapus.');
  };

  const inputCls = `px-3 py-2.5 rounded-xl border text-sm outline-none transition-colors
    ${isDark ? 'bg-navy-800 border-blue-900/40 text-slate-200 placeholder-slate-600 focus:border-blue-500/60' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-400'}`;

  /* ---- Loading / Error state ---- */
  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
    </div>
  );

  if (error) return (
    <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-8 text-center">
      <p className="text-red-400 text-sm font-medium mb-3">Gagal memuat aktivitas: {error}</p>
      <button onClick={refetch} className="btn-primary text-xs"><RefreshCw className="w-3.5 h-3.5" /> Coba Lagi</button>
    </div>
  );

  return (
    <div className="space-y-5 animate-slide-up">
      <PageHeader
        title="Aktivitas"
        subtitle={`${activities.length} aktivitas tercatat`}
        actions={
          <button onClick={() => setModal('add')} className="btn-primary text-sm px-4 py-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tambah Aktivitas</span>
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search */}
        <div className={`flex items-center gap-2 flex-1 ${inputCls}`}>
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input type="text" placeholder="Cari aktivitas..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" />
        </div>
        {/* Category */}
        <div className={`flex items-center gap-2 ${inputCls}`}>
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)} className="bg-transparent outline-none text-sm">
            <option value="all">Semua Kategori</option>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        {/* Date filter */}
        <div className={`flex items-center gap-2 ${inputCls}`}>
          <CalendarDays className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent outline-none text-sm" />
          {selectedDate && (
            <button onClick={() => setSelectedDate('')} className="text-slate-400 hover:text-slate-200 text-xs">✕</button>
          )}
        </div>
      </div>

      {/* Activity list */}
      <Card className="overflow-hidden">
        {activities.length === 0 ? (
          /* Empty state — no activities at all */
          <div className="py-16 text-center flex flex-col items-center gap-3">
            <div className="text-4xl">📋</div>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Belum ada aktivitas</p>
            <p className={`text-sm max-w-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Mulai catat aktivitasmu dengan menekan tombol "Tambah Aktivitas".</p>
            <button onClick={() => setModal('add')} className="btn-primary text-sm mt-2">
              <Plus className="w-4 h-4" /> Tambah Aktivitas Pertama
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Tidak ada aktivitas yang sesuai filter.</p>
          </div>
        ) : (
          <div className={`divide-y ${isDark ? 'divide-blue-900/30' : 'divide-slate-100'}`}>
            {filtered.map((act) => {
              const cat = getCat(act.category);
              return (
                <div key={act.id} className={`flex items-center gap-4 px-5 py-4 group transition-colors ${isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50'}`}>
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: `${cat.color}20` }}>
                    {cat.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{act.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{act.date}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: `${cat.color}20`, color: cat.color }}>{cat.label}</span>
                      {act.notes && <span className={`text-xs truncate max-w-[180px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{act.notes}</span>}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{formatDurationShort(act.duration)}</span>
                  </div>

                  {/* Action buttons — visible on hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={() => setModal(act)} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-blue-500/20 text-slate-400 hover:text-blue-400' : 'hover:bg-blue-50 text-slate-400 hover:text-blue-500'}`} title="Edit">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteTarget(act)} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/20 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-400 hover:text-red-500'}`} title="Hapus">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Summary row */}
      {filtered.length > 0 && (
        <p className={`text-xs text-center ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
          Menampilkan {filtered.length} dari {activities.length} aktivitas · Total: {Math.floor(filtered.reduce((s, a) => s + a.duration, 0) / 60)}j {filtered.reduce((s, a) => s + a.duration, 0) % 60}m
        </p>
      )}

      {/* Modals */}
      {(modal === 'add' || (modal && typeof modal === 'object')) && (
        <ActivityModal
          activity={modal !== 'add' ? modal : null}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm title={deleteTarget.title} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} isDark={isDark} />
      )}
      {toast && <Toast message={toast.message} type={toast.type} isDark={isDark} />}
    </div>
  );
}
