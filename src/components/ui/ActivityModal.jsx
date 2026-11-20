import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { CATEGORIES } from '../../utils/categories.js';

const EMPTY = { title: '', category: 'belajar', duration: '', date: new Date().toISOString().slice(0, 10), notes: '' };

function validate(f) {
  const e = {};
  if (!f.title.trim()) e.title = 'Judul wajib diisi.';
  if (!f.duration || isNaN(f.duration) || Number(f.duration) <= 0) e.duration = 'Durasi harus angka positif.';
  if (!f.date) e.date = 'Tanggal wajib diisi.';
  return e;
}

export default function ActivityModal({ activity, onSave, onClose }) {
  const { isDark } = useTheme();
  // activity.date is normalised by useActivities (maps activity_date → date)
  // activity.duration is normalised by useActivities (maps duration_minutes → duration)
  const [form, setForm] = useState(activity
    ? {
        title: activity.title || '',
        category: activity.category || 'belajar',
        duration: String(activity.duration ?? activity.duration_minutes ?? ''),
        date: activity.date ?? activity.activity_date ?? new Date().toISOString().slice(0, 10),
        notes: activity.notes || '',
      }
    : EMPTY
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  const set = (k) => (e) => {
    setForm((p) => ({ ...p, [k]: e.target.value }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    setServerError('');
    const payload = { title: form.title.trim(), category: form.category, duration: Number(form.duration), date: form.date, notes: form.notes.trim() };
    const { error } = await onSave(payload);
    setSaving(false);
    if (error) { setServerError(typeof error === 'string' ? error : (error.message || 'Gagal menyimpan.')); return; }
    onClose();
  };

  const overlay = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm';
  const modal = `w-full max-w-md rounded-2xl border p-6 shadow-2xl ${isDark ? 'bg-navy-800 border-blue-900/40' : 'bg-white border-slate-200'}`;

  const inp = `w-full px-3 py-2.5 rounded-xl text-sm outline-none border transition-colors
    ${isDark ? 'bg-navy-900 border-blue-900/50 text-slate-100 focus:border-blue-500/70 placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-400 placeholder-slate-400'}`;
  const errInp = isDark ? 'border-red-500/60' : 'border-red-400';

  return (
    <div className={overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={modal}>
        <div className="flex items-center justify-between mb-5">
          <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {activity ? 'Edit Aktivitas' : 'Tambah Aktivitas'}
          </h3>
          <button onClick={onClose} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {serverError && <div className="mb-4 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs">{serverError}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Judul Aktivitas *</label>
            <input className={`${inp} ${errors.title ? errInp : ''}`} value={form.title} onChange={set('title')} placeholder="Contoh: Belajar React" maxLength={100} />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Category + Duration row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Kategori</label>
              <select className={inp} value={form.category} onChange={set('category')}>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Durasi (menit) *</label>
              <input type="number" min={1} max={1440} className={`${inp} ${errors.duration ? errInp : ''}`} value={form.duration} onChange={set('duration')} placeholder="60" />
              {errors.duration && <p className="text-red-400 text-xs mt-1">{errors.duration}</p>}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Tanggal *</label>
            <input type="date" className={`${inp} ${errors.date ? errInp : ''}`} value={form.date} onChange={set('date')} max={new Date().toISOString().slice(0, 10)} />
            {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Catatan (opsional)</label>
            <textarea rows={2} className={`${inp} resize-none`} value={form.notes} onChange={set('notes')} placeholder="Tambahkan catatan..." maxLength={500} />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors
              ${isDark ? 'border-blue-900/40 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              Batal
            </button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary justify-center py-2.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (activity ? 'Simpan' : 'Tambah')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
