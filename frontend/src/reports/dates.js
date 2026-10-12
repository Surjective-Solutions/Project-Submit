// Month keys are 'YYYY-MM' strings (they sort correctly as plain text).
// Date keys are 'YYYY-MM-DD'.

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Earliest month offered in the custom range pickers.
export const EARLIEST_MONTH = '2025-01';

// Earliest date the date pickers allow.
export const EARLIEST_DATE = '2025-01-01';

const pad = (n) => String(n).padStart(2, '0');

export function monthKey(year, monthIndex) {
  return `${year}-${pad(monthIndex + 1)}`;
}

export function parseMonthKey(key) {
  const [year, month] = key.split('-').map(Number);
  return { year, monthIndex: month - 1 };
}

export function monthShortName(key) {
  return MONTH_NAMES[parseMonthKey(key).monthIndex];
}

export function monthLabel(key) {
  const { year, monthIndex } = parseMonthKey(key);
  return `${MONTH_NAMES[monthIndex]} ${year}`;
}

export function shiftMonth(key, delta) {
  const { year, monthIndex } = parseMonthKey(key);
  const total = year * 12 + monthIndex + delta;
  return monthKey(Math.floor(total / 12), total % 12);
}

export function currentMonthKey(now = new Date()) {
  return monthKey(now.getFullYear(), now.getMonth());
}

export function todayDateKey(now = new Date()) {
  return `${monthKey(now.getFullYear(), now.getMonth())}-${pad(now.getDate())}`;
}

export function daysInMonth(key) {
  const { year, monthIndex } = parseMonthKey(key);
  return new Date(year, monthIndex + 1, 0).getDate();
}

// Inclusive range, newest month first. Empty when from is after to.
export function monthRange(fromKey, toKey) {
  const keys = [];
  for (let k = toKey; k >= fromKey; k = shiftMonth(k, -1)) keys.push(k);
  return keys;
}

// Options for the custom From/To selects, newest first.
export function monthOptions(nowKey) {
  return monthRange(EARLIEST_MONTH, nowKey).map((key) => ({ key, label: monthLabel(key) }));
}

// '2026-10-03' -> '03 Oct 2026'
export function formatDate(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return `${pad(day)} ${MONTH_NAMES[month - 1]} ${year}`;
}
