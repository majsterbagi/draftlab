export const PLATFORMS = ['PC', 'PS5', 'PS4', 'Xbox', 'Switch', 'Inna'];

export const STATUSES = [
  { id: 'backlog', label: 'Kupka' },
  { id: 'playing', label: 'Gram' },
  { id: 'done', label: 'Ukończona' },
  { id: 'dropped', label: 'Porzucona' },
];

export const STATUS_LABELS = Object.fromEntries(STATUSES.map(s => [s.id, s.label]));

const dateFormat = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function formatDate(date) {
  return date ? dateFormat.format(date) : '—';
}

export function formatHours(hours) {
  if (hours === null || hours === undefined) return '?';
  return Number.isInteger(hours) ? `${hours} h` : `${hours.toFixed(1)} h`;
}
