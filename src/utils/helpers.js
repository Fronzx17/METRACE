/**
 * METRACE — Utility Helpers
 */

/**
 * Format duration in minutes to human-readable string
 * @param {number} minutes
 * @returns {string}
 */
export function formatDuration(minutes) {
  if (!minutes || minutes < 0) return '0 menit';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} menit`;
  if (m === 0) return `${h} jam`;
  return `${h} jam ${m} menit`;
}

/**
 * Format minutes to compact display (e.g. "2j 30m")
 */
export function formatDurationShort(minutes) {
  if (!minutes || minutes < 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}j`;
  return `${h}j ${m}m`;
}

/**
 * Get category config by id
 */
export function getCategoryById(categories, id) {
  return categories.find((c) => c.id === id) || categories[categories.length - 1];
}

/**
 * Calculate percentage
 */
export function calcPercent(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Get greeting based on current hour
 * @returns {string}
 */
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Selamat Pagi';
  if (hour >= 12 && hour < 15) return 'Selamat Siang';
  if (hour >= 15 && hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

/**
 * Format date to Indonesian locale string
 */
export function formatDateId(date) {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Clamp a number between min and max
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate a unique-ish id (not cryptographically secure — for demo use only)
 */
export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
