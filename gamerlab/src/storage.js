// Zapis stanu w localStorage — w v0.3 wymienimy na Supabase, stąd osobny moduł.

const KEY = 'gamerlab:v1';

const DEFAULT_STATE = {
  weeklyHours: 6,
  games: [],
};

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATE,
      ...parsed,
      games: Array.isArray(parsed.games) ? parsed.games : [],
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}
