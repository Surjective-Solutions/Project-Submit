import { DEFAULT_SHARES, SESSION_ACCESS, SESSION_NAME_MAX } from './constants';
import { formatTime } from './utils';

// Pure helpers for the sessions inside a class: dates, the form, validation and labels.
//
// Dates are kept as local clock strings, "YYYY-MM-DDTHH:mm", with no time zone: a session starts at 6:00 PM
// at the hall whatever the viewer's computer thinks the time zone is.

export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ── Recording codes ─────────────────────────────────────────────────────────

// Codes are pasted from Class Recordings: trim, remove spaces, upper-case.
export const normalizeCode = (value) => String(value ?? '').replace(/\s+/g, '').toUpperCase();

// ── Dates ───────────────────────────────────────────────────────────────────

export function splitLocal(value) {
  const match = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/.exec(String(value || ''));
  if (match) return { date: match[1], time: match[2] };
  const dateOnly = /^(\d{4}-\d{2}-\d{2})$/.exec(String(value || ''));
  return { date: dateOnly ? dateOnly[1] : '', time: '' };
}

export const joinLocal = (date, time) => (date && time ? `${date}T${time}` : '');

// "2026-03-14" -> "Sat, 14 Mar 2026"
export function formatDate(date) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date || ''));
  if (!match) return '';
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return `${WEEKDAYS[weekday]}, ${day} ${MONTHS[month - 1]} ${year}`;
}

// "2026-03-14T08:30" -> "Sat, 14 Mar 2026 · 8:30 AM"
export function formatDateTime(value) {
  const { date, time } = splitLocal(value);
  if (!date) return '';
  return time ? `${formatDate(date)} · ${formatTime(time)}` : formatDate(date);
}

// The date and the time apart, for a table cell that shows them on two lines.
export function formatDateParts(value) {
  const { date, time } = splitLocal(value);
  return { date: formatDate(date), time: time ? formatTime(time) : '' };
}

// "2026-06-14" -> "14 Jun 2026"
export function formatClassDate(date) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(date || ''));
  return match ? `${Number(match[3])} ${MONTHS[Number(match[2]) - 1]} ${match[1]}` : '';
}

// 96 -> "1h 36m"
export function formatDuration(minutes) {
  const total = Math.max(0, Math.round(Number(minutes) || 0));
  return `${Math.floor(total / 60)}h ${String(total % 60).padStart(2, '0')}m`;
}

const pad = (n) => String(n).padStart(2, '0');

export function nowLocal(now = new Date()) {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export function isExpired(session, now = new Date()) {
  return !!session.expiresAt && session.expiresAt <= nowLocal(now);
}

// Newest start first.
export function sortSessions(sessions) {
  return [...sessions].sort(
    (a, b) => String(b.startsAt).localeCompare(String(a.startsAt)) || String(a.name).localeCompare(String(b.name)),
  );
}

// ── Labels ──────────────────────────────────────────────────────────────────

export const accessLabel = (value) => SESSION_ACCESS.find((a) => a.value === value)?.label ?? '';

// "Online" or "Physical · Hall A · Maharagama"
export function modeSummary(session) {
  if (session.mode === 'physical') return ['Physical', session.hall].filter(Boolean).join(' · ');
  return 'Online';
}

// ── The form ────────────────────────────────────────────────────────────────
// Numbers are kept as digit strings so an input can be cleared and retyped.

export function digitsOnly(value, maxLength = 3) {
  return String(value ?? '')
    .split('.')[0]
    .replace(/[^0-9]/g, '')
    .slice(0, maxLength);
}

export const toNumber = (value) => Number(digitsOnly(value)) || 0;

export function emptyForm() {
  return {
    name: '',
    access: 'registered',
    mode: 'online',
    startDate: '',
    startTime: '',
    hall: '',
    expiresDate: '',
    expiresTime: '',
    shares: Object.fromEntries(Object.entries(DEFAULT_SHARES).map(([key, value]) => [key, String(value)])),
  };
}

export function sessionToForm(session) {
  const start = splitLocal(session.startsAt);
  const expires = splitLocal(session.expiresAt);
  const shares = session.shares || DEFAULT_SHARES;
  return {
    name: session.name || '',
    access: session.access || 'registered',
    mode: session.mode === 'physical' ? 'physical' : 'online',
    startDate: start.date,
    startTime: start.time,
    hall: session.hall || '',
    expiresDate: expires.date,
    expiresTime: expires.time,
    shares: {
      teacher: String(shares.teacher ?? 0),
      institute: String(shares.institute ?? 0),
      system: String(shares.system ?? 0),
    },
  };
}

export const shareTotal = (shares) => toNumber(shares.teacher) + toNumber(shares.institute) + toNumber(shares.system);

// Expiry given as a date alone ends at the end of that day.
export function expiryOf(form) {
  if (!form.expiresDate) return '';
  return joinLocal(form.expiresDate, form.expiresTime || '23:59');
}

export function formToPayload(form, recordingCode) {
  return {
    name: form.name.trim(),
    access: form.access,
    mode: form.mode,
    startsAt: joinLocal(form.startDate, form.startTime),
    expiresAt: expiryOf(form) || null,
    hall: form.mode === 'physical' ? form.hall : null,
    recordingCode: recordingCode || null,
    shares: {
      teacher: toNumber(form.shares.teacher),
      institute: toNumber(form.shares.institute),
      system: toNumber(form.shares.system),
    },
  };
}

export const ERROR_MESSAGES = {
  name: 'Give the session a name.',
  startDate: 'Pick the start date.',
  startTime: 'Pick the start time.',
  hall: 'Pick the hall.',
  expires: 'The expiry must be after the start.',
  expiresDate: 'Pick the expiry date as well.',
  shares: 'The shares must add up to 100%.',
};

export function validateSession(form) {
  const start = joinLocal(form.startDate, form.startTime);
  const expiry = expiryOf(form);
  const errors = {
    name: !form.name.trim() || form.name.trim().length > SESSION_NAME_MAX,
    startDate: !form.startDate,
    startTime: !form.startTime,
    hall: form.mode === 'physical' && !form.hall,
    expiresDate: !form.expiresDate && !!form.expiresTime,
    expires: !!expiry && !!start && expiry <= start,
    shares: shareTotal(form.shares) !== 100,
  };
  return { errors, count: Object.values(errors).filter(Boolean).length, total: shareTotal(form.shares) };
}

// ── Months ──────────────────────────────────────────────────────────────────
// The sessions list is shown one month at a time. A month is { year, month } with month 1 to 12.

export const monthKey = ({ year, month }) => `${year}-${String(month).padStart(2, '0')}`;

export function monthOf(startsAt) {
  const { date } = splitLocal(startsAt);
  return date ? { year: Number(date.slice(0, 4)), month: Number(date.slice(5, 7)) } : null;
}

export const formatMonth = ({ year, month }) => `${MONTH_NAMES[month - 1]} ${year}`;

export function shiftMonth({ year, month }, delta) {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

export function sessionsInMonth(sessions, period) {
  return sessions.filter((session) => {
    const m = monthOf(session.startsAt);
    return m && monthKey(m) === monthKey(period);
  });
}

// How many sessions start in each month: { '2026-10': 5 }
export function monthCounts(sessions) {
  const counts = {};
  for (const session of sessions) {
    const m = monthOf(session.startsAt);
    if (m) counts[monthKey(m)] = (counts[monthKey(m)] || 0) + 1;
  }
  return counts;
}

// The month shown first: this month, unless it has no sessions and the class has others, in which case the
// latest month up to now that has some (or, if all are later, the earliest of those).
export function defaultMonth(sessions, now = new Date()) {
  const current = { year: now.getFullYear(), month: now.getMonth() + 1 };
  const keys = Object.keys(monthCounts(sessions)).sort();
  if (!keys.length || keys.includes(monthKey(current))) return current;
  const pick = [...keys].reverse().find((k) => k <= monthKey(current)) || keys[0];
  return { year: Number(pick.slice(0, 4)), month: Number(pick.slice(5, 7)) };
}

// Years offered in the picker: every year with sessions, this year, and the year already chosen.
export function yearOptions(sessions, period, now = new Date()) {
  const years = new Set([now.getFullYear(), period.year]);
  for (const session of sessions) {
    const m = monthOf(session.startsAt);
    if (m) years.add(m.year);
  }
  return [...years].sort((a, b) => b - a);
}
