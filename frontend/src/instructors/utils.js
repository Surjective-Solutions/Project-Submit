// Small helpers for the teacher Instructors page.

// "52740", "INS52740", "ins 52740" and "INS-52740" all become "INS-52740".
// Returns { id } when it is valid, or { error } with a message that is safe to show.
export function normaliseInstructorId(raw) {
  const text = String(raw ?? '').trim().toUpperCase().replace(/\s+/g, '');
  if (!text) return { error: 'Enter an Instructor ID.' };
  const match = /^(?:INS-?)?(\d{5})$/.exec(text);
  if (!match) return { error: 'That doesn’t look like an Instructor ID. IDs look like INS-52740.' };
  return { id: `INS-${match[1]}` };
}

// hasini.r@gmail.com -> ha••••@gmail.com (never the whole address)
export function maskEmail(email) {
  const [local = '', domain = ''] = String(email ?? '').split('@');
  if (!domain) return '';
  return `${local.slice(0, 2)}••••@${domain}`;
}

const HONORIFICS = /^(mr|mrs|ms|miss|dr|prof|rev)\.?$/i;
const nameParts = (name) => String(name ?? '').split(/\s+/).filter((part) => part && !HONORIFICS.test(part));

export function initials(name) {
  const parts = nameParts(name);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const firstName = (name) => nameParts(name)[0] ?? String(name ?? '');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayKey = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

// "2026-10-12" or an ISO date-time -> "12 Oct 2026", or "Today" when it is today.
export function formatAdded(value, now = new Date()) {
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return '—';
  if (dayKey(date) === dayKey(now)) return 'Today';
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;
