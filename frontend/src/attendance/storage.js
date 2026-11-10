import { STORAGE_KEY } from './constants';
import { isIsoDate, isMonthKey } from './utils';

// Browser storage can be missing or blocked (private windows, blocked site data), so every access is
// guarded and the page works without it. Only the last student ID, tutor, date and month are kept.

export function loadSaved() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const value = raw ? JSON.parse(raw) : null;
    if (!value || typeof value !== 'object') return {};
    return {
      studentId: typeof value.studentId === 'string' ? value.studentId.slice(0, 40) : '',
      tutorId: typeof value.tutorId === 'string' ? value.tutorId.slice(0, 40) : '',
      date: isIsoDate(value.date) ? value.date : '',
      month: isMonthKey(value.month) ? value.month : '',
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
