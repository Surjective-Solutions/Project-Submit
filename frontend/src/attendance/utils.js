import {
  FALLBACK_SINCE_MONTH,
  MONTHS_LONG,
  MONTHS_SHORT,
  ON_TIME_MINUTES,
  STATUS_KEYS,
  WEEKDAYS_LONG,
  WEEKDAYS_SHORT,
} from './constants';

const pad = (n) => String(n).padStart(2, '0');

// ── Dates. All dates are local "YYYY-MM-DD" strings and months are "YYYY-MM" keys. ──

export function toIso(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseIso(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isIsoDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && toIso(parseIso(value)) === value;
}

export function isMonthKey(value) {
  return typeof value === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

export function todayIso(now = new Date()) {
  return toIso(now);
}

export function addDays(iso, n) {
  const d = parseIso(iso);
  d.setDate(d.getDate() + n);
  return toIso(d);
}

export function weekdayOf(iso) {
  return parseIso(iso).getDay(); // 0 = Sunday
}

export function monthKey(iso) {
  return iso.slice(0, 7);
}

export function daysInMonth(key) {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}

export function addMonths(key, n) {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

// Months from the one containing `fromIso` to the one containing `toIsoDate`, newest first.
export function monthsBetween(fromIso, toIsoDate) {
  const first = monthKey(fromIso);
  const list = [];
  let current = monthKey(toIsoDate);
  while (current >= first) {
    list.push(current);
    current = addMonths(current, -1);
  }
  return list;
}

export function clampDate(iso, min, max) {
  if (min && iso < min) return min;
  if (max && iso > max) return max;
  return iso;
}

// The date a student's record is counted from when the API gives no enrolment start: 1 June.
export function fallbackSince(today) {
  const year = Number(today.slice(0, 4));
  const june = `${year}-${pad(FALLBACK_SINCE_MONTH)}-01`;
  return june <= today ? june : `${year - 1}-${pad(FALLBACK_SINCE_MONTH)}-01`;
}

// Cells for a Monday-first month grid: leading nulls, then every day of the month as an ISO date.
export function buildCalendar(key) {
  const offset = (weekdayOf(`${key}-01`) + 6) % 7;
  const cells = Array.from({ length: offset }, () => null);
  for (let day = 1; day <= daysInMonth(key); day += 1) cells.push(`${key}-${pad(day)}`);
  return cells;
}

// ── Formatting ──

export function formatLongDate(iso) {
  const d = parseIso(iso);
  return `${WEEKDAYS_LONG[d.getDay()]}, ${d.getDate()} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatShortDate(iso) {
  const d = parseIso(iso);
  return `${WEEKDAYS_SHORT[d.getDay()]} ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

export function formatDayCell(iso) {
  const d = parseIso(iso);
  return `${WEEKDAYS_SHORT[d.getDay()]} ${pad(d.getDate())}`;
}

export function formatMonthLabel(key) {
  const [y, m] = key.split('-').map(Number);
  return `${MONTHS_SHORT[m - 1]} ${y}`;
}

export function formatMonthTitle(key) {
  const [y, m] = key.split('-').map(Number);
  return `${MONTHS_LONG[m - 1]} ${y}`;
}

// "18:00" -> "6:00 PM"
export function formatClock(hhmm) {
  const [h, m] = String(hhmm).split(':').map(Number);
  return `${h % 12 || 12}:${pad(m || 0)} ${h >= 12 ? 'PM' : 'AM'}`;
}

// A scan timestamp -> "6:24 PM" in the viewer's local time.
export function formatScanTime(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return formatClock(`${d.getHours()}:${d.getMinutes()}`);
}

// "June", or "June 2025" when the record starts in an earlier year than today.
export function sinceLabel(sinceIso, today) {
  const d = parseIso(sinceIso);
  const month = MONTHS_LONG[d.getMonth()];
  return d.getFullYear() === Number(today.slice(0, 4)) ? month : `${month} ${d.getFullYear()}`;
}

export function formatPhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  return /^0\d{9}$/.test(digits) ? `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}` : String(value ?? '');
}

export function initialsOf(name) {
  const parts = String(name ?? '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return `${first}${last}`.toUpperCase();
}

export function firstName(student) {
  return String(student?.name ?? '').trim().split(/\s+/)[0] || 'The student';
}

// ── Barcodes ──

// Student IDs match ignoring case, spaces and dashes: "sy 26 04821" = "SY-26-04821".
export function normalizeBarcode(value) {
  return String(value ?? '').toLowerCase().replace(/[\s-]+/g, '');
}

// ── Phone numbers ──

// A Sri Lankan mobile number typed any way ("077 123 4567", "+94 77 123 4567", "94771234567",
// "771234567") -> its 9 digits "771234567", or '' when it is not one.
export function normalizePhone(value) {
  let digits = String(value ?? '').replace(/\D/g, '');
  if (digits.startsWith('94')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return /^7\d{8}$/.test(digits) ? digits : '';
}

// The phone field as the user types or pastes: digits only, without a leading 0 or 94, grouped "77 123 4567".
export function formatPhoneInput(value) {
  let digits = String(value ?? '').replace(/\D/g, '');
  if (digits.startsWith('94') && digits.length > 9) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = digits.slice(1);
  digits = digits.slice(0, 9);
  return [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5)].filter(Boolean).join(' ');
}

// ── Tutors ──

export function surname(name) {
  const parts = String(name).trim().split(/\s+/);
  return parts[parts.length - 1];
}

export function sortTutors(list) {
  return [...list].sort(
    (a, b) =>
      surname(a.name).localeCompare(surname(b.name), 'en', { sensitivity: 'base' }) || a.name.localeCompare(b.name),
  );
}

export function tutorLabel(tutor) {
  return `${tutor.name} — ${tutor.subjects.join(', ')}`;
}

// ── Classes and attendance ──

export function minutesOf(hhmm) {
  const [h, m] = String(hhmm).split(':').map(Number);
  return h * 60 + (m || 0);
}

// An enrolled class's weekday as 0–6 (Sunday = 0). Accepts a number or "Thu" / "Thursday".
export function weekdayIndex(value) {
  if (typeof value === 'number') return value;
  return WEEKDAYS_SHORT.findIndex((d) => d.toLowerCase() === String(value).slice(0, 3).toLowerCase());
}

// Present = scanned in at or before 10 minutes after the start. Late = later. Absent = no scan.
export function statusFromScan(startTime, scannedAt) {
  if (!scannedAt) return 'absent';
  const d = new Date(scannedAt);
  if (Number.isNaN(d.getTime())) return 'absent';
  const scanned = d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
  return scanned - minutesOf(startTime) <= ON_TIME_MINUTES ? 'present' : 'late';
}

export function worstStatus(statuses) {
  let worst = null;
  statuses.forEach((s) => {
    if (!worst || STATUS_KEYS.indexOf(s) > STATUS_KEYS.indexOf(worst)) worst = s;
  });
  return worst;
}

// Attendance % = (present + late) / scheduled classes.
export function summarize(records) {
  const counts = { present: 0, late: 0, absent: 0 };
  records.forEach((r) => {
    if (r.status in counts) counts[r.status] += 1;
  });
  const total = counts.present + counts.late + counts.absent;
  const attended = counts.present + counts.late;
  return { ...counts, total, attended, percent: total ? Math.round((attended / total) * 100) : null };
}

export function groupByDate(records) {
  const map = new Map();
  records.forEach((r) => {
    if (!map.has(r.date)) map.set(r.date, []);
    map.get(r.date).push(r);
  });
  map.forEach((list) => list.sort((a, b) => a.startTime.localeCompare(b.startTime)));
  return map;
}

export function sortNewestFirst(records) {
  return [...records].sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime));
}

// The latest class before `iso`.
export function lastClassBefore(records, iso) {
  let best = null;
  records.forEach((r) => {
    if (r.date >= iso) return;
    if (!best || r.date > best.date || (r.date === best.date && r.startTime > best.startTime)) best = r;
  });
  return best;
}
