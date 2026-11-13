import { ALL, CLASS_TYPES, LEVELS, STORAGE_KEY } from './constants';

// Browser storage can be missing or blocked, so every access is guarded and the pages work without it.
// What is kept: the level tab on the directory, and the batch / type filters of the tutor last opened.

const clean = (value, allowed) => (allowed.includes(value) ? value : ALL);

export function loadSaved() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const value = raw ? JSON.parse(raw) : null;
    if (!value || typeof value !== 'object') return { level: ALL, tutorId: '', batch: ALL, type: ALL };
    return {
      level: clean(value.level, LEVELS),
      tutorId: typeof value.tutorId === 'string' ? value.tutorId.slice(0, 64) : '',
      batch: typeof value.batch === 'string' && /^\d{4} (A|O)\/L$/.test(value.batch) ? value.batch : ALL,
      type: clean(value.type, CLASS_TYPES),
    };
  } catch {
    return { level: ALL, tutorId: '', batch: ALL, type: ALL };
  }
}

// Merges `patch` into what is saved.
export function save(patch) {
  try {
    const next = { ...loadSaved(), ...patch };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage is optional.
  }
}

// Opening a tutor starts from All batches and All types.
export function resetFiltersFor(tutorId) {
  save({ tutorId: String(tutorId), batch: ALL, type: ALL });
}
