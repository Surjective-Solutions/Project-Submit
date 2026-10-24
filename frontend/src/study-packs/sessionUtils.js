import { formatDuration } from './utils';

// Helpers for step 2 of the study pack flow (adding recordings as sessions).

export const TITLE_MAX = 90;

// "rec-phy-0614-k7 " -> "REC-PHY-0614-K7"
export function normalizeCode(raw) {
  return String(raw ?? '')
    .replace(/\s+/g, '')
    .toUpperCase();
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parts(ymd) {
  const [y, m, d] = String(ymd ?? '')
    .split('-')
    .map(Number);
  return { y, m, d };
}

// "2026-06-14" -> "14 Jun 2026"
export function formatClassDate(ymd) {
  const { y, m, d } = parts(ymd);
  if (!y || !m || !d) return '';
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

function formatShortDate(ymd) {
  const { m, d } = parts(ymd);
  return `${d} ${MONTHS[m - 1]}`;
}

// Earliest to latest class date, e.g. "3 May – 7 Jun 2026".
export function lessonsFromLabel(dates) {
  const valid = dates.filter(Boolean).sort();
  if (valid.length === 0) return '—';
  const first = valid[0];
  const last = valid[valid.length - 1];
  if (first === last) return formatClassDate(first);
  if (parts(first).y === parts(last).y) return `${formatShortDate(first)} – ${formatClassDate(last)}`;
  return `${formatClassDate(first)} – ${formatClassDate(last)}`;
}

export function totalMinutes(items) {
  return items.reduce((sum, item) => sum + (item.recording?.durationMins || 0), 0);
}

export function sessionsSummary(items) {
  if (items.length === 0) return 'Nothing added yet';
  const noun = items.length === 1 ? 'session' : 'sessions';
  return `${items.length} ${noun} · ${formatDuration(totalMinutes(items))} · students watch in this order`;
}

export function renumber(items) {
  return items.map((item, index) => ({ ...item, order: index + 1 }));
}

// ["a"] -> "a", ["a","b"] -> "a and b", ["a","b","c"] -> "a, b and c"
export function joinList(list) {
  if (list.length <= 1) return list.join('');
  return `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
}

const MISSING_LABELS = {
  name: 'a name',
  teacherId: 'a teacher',
  grade: 'a grade',
  subject: 'a subject',
  price: 'a price above zero',
  validity: 'a number of access days',
  shares: 'revenue shares that total 100%',
};

// What is still missing before a pack can be published (or saved while live).
// `errors` is the errors object from validatePack().
export function missingForPublish(errors, sessionCount) {
  const list = Object.keys(MISSING_LABELS)
    .filter((key) => errors[key])
    .map((key) => MISSING_LABELS[key]);
  if (sessionCount === 0) list.push('at least one session');
  return list;
}
