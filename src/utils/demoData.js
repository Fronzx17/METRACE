/**
 * METRACE — Demo Data
 * Clearly labeled demonstration data for visual previews.
 * This is NOT real user data.
 */

export const DEMO_CATEGORIES = [
  { id: 'belajar', label: 'Belajar', color: '#3b82f6', icon: '📚' },
  { id: 'kerja', label: 'Kerja', color: '#8b5cf6', icon: '💼' },
  { id: 'olahraga', label: 'Olahraga', color: '#10b981', icon: '🏃' },
  { id: 'hiburan', label: 'Hiburan', color: '#f59e0b', icon: '🎮' },
  { id: 'istirahat', label: 'Istirahat', color: '#06b6d4', icon: '😴' },
  { id: 'sosial', label: 'Sosial', color: '#ec4899', icon: '👥' },
  { id: 'lainnya', label: 'Lainnya', color: '#6b7280', icon: '📌' },
];

export const DEMO_ACTIVITIES = [
  {
    id: 1,
    title: 'Belajar Algoritma & Struktur Data',
    category: 'belajar',
    duration: 120,
    date: '2026-11-20',
    startTime: '08:00',
    endTime: '10:00',
    notes: 'Fokus pada materi sorting dan searching',
  },
  {
    id: 2,
    title: 'Rapat Tim Proyek',
    category: 'kerja',
    duration: 90,
    date: '2026-11-20',
    startTime: '10:30',
    endTime: '12:00',
    notes: 'Review sprint dan planning minggu depan',
  },
  {
    id: 3,
    title: 'Makan Siang & Istirahat',
    category: 'istirahat',
    duration: 60,
    date: '2026-11-20',
    startTime: '12:00',
    endTime: '13:00',
    notes: '',
  },
  {
    id: 4,
    title: 'Coding Side Project',
    category: 'kerja',
    duration: 150,
    date: '2026-11-20',
    startTime: '13:00',
    endTime: '15:30',
    notes: 'Implementasi fitur dashboard',
  },
  {
    id: 5,
    title: 'Jogging Sore',
    category: 'olahraga',
    duration: 45,
    date: '2026-11-20',
    startTime: '17:00',
    endTime: '17:45',
    notes: '5km di sekitar komplek',
  },
  {
    id: 6,
    title: 'Nonton Series Netflix',
    category: 'hiburan',
    duration: 90,
    date: '2026-11-19',
    startTime: '20:00',
    endTime: '21:30',
    notes: 'Dark — episode 3',
  },
  {
    id: 7,
    title: 'Belajar UI/UX Design',
    category: 'belajar',
    duration: 60,
    date: '2026-11-19',
    startTime: '15:00',
    endTime: '16:00',
    notes: 'Course Figma fundamental',
  },
  {
    id: 8,
    title: 'Nongkrong dengan Teman',
    category: 'sosial',
    duration: 120,
    date: '2026-11-19',
    startTime: '18:00',
    endTime: '20:00',
    notes: 'Di kafe Jalan Sudirman',
  },
];

export const DEMO_WEEKLY_DATA = [
  { day: 'Sen', belajar: 120, kerja: 180, olahraga: 45, hiburan: 60, istirahat: 60, sosial: 30 },
  { day: 'Sel', belajar: 90, kerja: 240, olahraga: 0, hiburan: 90, istirahat: 60, sosial: 60 },
  { day: 'Rab', belajar: 150, kerja: 120, olahraga: 60, hiburan: 30, istirahat: 60, sosial: 0 },
  { day: 'Kam', belajar: 60, kerja: 180, olahraga: 45, hiburan: 60, istirahat: 60, sosial: 90 },
  { day: 'Jum', belajar: 180, kerja: 90, olahraga: 30, hiburan: 120, istirahat: 60, sosial: 30 },
  { day: 'Sab', belajar: 60, kerja: 30, olahraga: 90, hiburan: 180, istirahat: 90, sosial: 120 },
  { day: 'Min', belajar: 90, kerja: 0, olahraga: 60, hiburan: 150, istirahat: 120, sosial: 60 },
];

export const DEMO_DISTRIBUTION = [
  { name: 'Belajar', value: 750, color: '#3b82f6' },
  { name: 'Kerja', value: 840, color: '#8b5cf6' },
  { name: 'Olahraga', value: 330, color: '#10b981' },
  { name: 'Hiburan', value: 690, color: '#f59e0b' },
  { name: 'Istirahat', value: 510, color: '#06b6d4' },
  { name: 'Sosial', value: 390, color: '#ec4899' },
];

export const DEMO_STATS = {
  totalMinutes: 3510,
  totalActivities: 8,
  mostActiveCategory: 'Kerja',
  mostActiveCategoryMinutes: 840,
  streakDays: 7,
  productivityScore: 78,
};
