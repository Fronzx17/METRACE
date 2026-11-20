/**
 * METRACE — CATEGORIES config (single source of truth)
 * Used across Activities, Dashboard, Timeline, TimeFingerprint
 */
export const CATEGORIES = [
  { id: 'belajar',   label: 'Belajar',   color: '#3b82f6', icon: '📚' },
  { id: 'kerja',     label: 'Kerja',     color: '#8b5cf6', icon: '💼' },
  { id: 'olahraga',  label: 'Olahraga',  color: '#10b981', icon: '🏃' },
  { id: 'hiburan',   label: 'Hiburan',   color: '#f59e0b', icon: '🎮' },
  { id: 'istirahat', label: 'Istirahat', color: '#06b6d4', icon: '😴' },
  { id: 'sosial',    label: 'Sosial',    color: '#ec4899', icon: '👥' },
  { id: 'pribadi',   label: 'Pribadi',   color: '#f97316', icon: '🧘' },
  { id: 'lainnya',   label: 'Lainnya',   color: '#6b7280', icon: '📌' },
];

export function getCat(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

export const DAYS_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
