import { STORAGE_KEY } from './constants';
import { isIsoDate } from './utils';

// Browser storage can be missing or blocked (private windows, blocked site data), so every access is
// guarded and the page works without it. Only the last tutor and class date are kept. A student is never
// remembered, so the page always opens on the empty prompt.

export function loadSaved() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const value = raw ? JSON.parse(raw) : null;
    if (!value || typeof value !== 'object') return {};
    return {
      tutorId: typeof value.tutorId === 'string' ? value.tutorId.slice(0, 40) : '',
      date: isIsoDate(value.date) ? value.date : '',
    };
  } catch {
    return {};
  }
}

export function save(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage is optional.
  }
}
