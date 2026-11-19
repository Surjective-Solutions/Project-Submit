const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const parseDate = (iso) => {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return { y, m, d, weekday: new Date(Date.UTC(y, m - 1, d)).getUTCDay() };
};

// "2026-11-19T13:40" -> minutes since midnight (13:40 -> 820)
export const minutesOfStamp = (stamp) => {
  const [h, m] = stamp.slice(11, 16).split(':').map(Number);
  return h * 60 + m;
};
export const minutesOfClock = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

// "Thursday, 19 November"
export function formatLongDate(iso) {
  const { d, m, weekday } = parseDate(iso);
  return `${DAYS[weekday]}, ${d} ${MONTHS[m - 1]}`;
}

export function greetingFor(stamp) {
  const hour = Math.floor(minutesOfStamp(stamp) / 60);
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// "14:00" -> { time: "2.00", suffix: "pm" }
export function clock12(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const hour = h % 12 === 0 ? 12 : h % 12;
  return { time: `${hour}.${String(m).padStart(2, '0')}`, suffix: h < 12 ? 'am' : 'pm' };
}

// "7.00 to 8.30 pm", or "11.00 am to 1.00 pm" across noon
export function formatRange(start, end) {
  const a = clock12(start);
  const b = clock12(end);
  return a.suffix === b.suffix ? `${a.time} to ${b.time} ${b.suffix}` : `${a.time} ${a.suffix} to ${b.time} ${b.suffix}`;
}

// Where a session stands against "now": upcoming ("In 20 min"), running ("Now") or over.
export function sessionTiming(asOf, start, end) {
  const now = minutesOfStamp(asOf);
  const from = minutesOfClock(start);
  const to = minutesOfClock(end);
  if (now >= to) return { state: 'over', label: 'Finished' };
  if (now >= from) return { state: 'now', label: 'Now' };
  const wait = from - now;
  if (wait < 60) return { state: 'soon', label: `In ${wait} min` };
  const h = Math.floor(wait / 60);
  const m = wait % 60;
  return { state: 'later', label: m ? `In ${h} h ${m} min` : `In ${h} h` };
}

export const weekdayShort = (iso) => DAYS[parseDate(iso).weekday].slice(0, 3);
export const dayOfMonth = (iso) => parseDate(iso).d;

export const money = (amount) => `Rs. ${Number(amount).toLocaleString('en-US')}`;
export const percent = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0);

export function initialsOf(name) {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

// "Mr. Kasun Silva" -> "Kasun"
export function firstNameOf(displayName) {
  const words = String(displayName || '').trim().split(/\s+/).filter(Boolean);
  while (words.length > 1 && /^(mr|mrs|ms|miss|dr|prof|rev)\.?$/i.test(words[0])) words.shift();
  return words[0] || '';
}
