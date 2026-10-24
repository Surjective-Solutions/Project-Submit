import { COVER_TYPES, DEFAULT_SHARES, LIMITS } from './constants';

// ── Covers ──────────────────────────────────────────────────────────────

const TINTS = {
  red: { bg: '#FCEBE9', ink: '#9E1117' },
  blue: { bg: '#E9ECF8', ink: '#223385' },
  cyan: { bg: '#E4F5FC', ink: '#0B4F6E' },
  yellow: { bg: '#FBF6D9', ink: '#5C4E00' },
};

const SUBJECT_TINT = {
  Physics: 'red',
  SFT: 'red',
  'Combined Maths': 'blue',
  Accounting: 'blue',
  Chemistry: 'cyan',
  ICT: 'cyan',
  'Business Studies': 'cyan',
  'Mathematics (O/L)': 'cyan',
  Biology: 'yellow',
  Economics: 'yellow',
  'Science (O/L)': 'yellow',
};

// No subject yet (an empty form) gets a neutral grey block.
export function coverTint(subject) {
  if (!subject) return { bg: '#F1F3F7', ink: '#8B90A0' };
  return TINTS[SUBJECT_TINT[subject] ?? 'blue'];
}

// ── Labels and formatting ───────────────────────────────────────────────

export function validityLabel(validity, customDays) {
  switch (validity) {
    case '1m':
      return '1 month access';
    case '3m':
      return '3 months access';
    case '6m':
      return '6 months access';
    case 'exam':
      return 'Access until exam day';
    default:
      return `${customDays || '—'} days access`;
  }
}

export function validityHint(validity) {
  return validity === 'exam'
    ? 'Access ends on the exam date for the selected grade.'
    : 'Counted from the day the student buys the pack.';
}

export function teacherName(teachers, teacherId) {
  if (teacherId === '' || teacherId == null) return '';
  return teachers.find((t) => String(t.id) === String(teacherId))?.name ?? '';
}

export function formatLkr(amount) {
  return `LKR ${Number(amount || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

// Shows a digit string with thousands commas ("4500" -> "4,500").
export function formatThousands(digits) {
  if (!digits) return '';
  return Number(digits).toLocaleString('en-US');
}

export function formatDuration(minutes) {
  const total = Math.max(0, Math.round(Number(minutes) || 0));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

export function sessionsLabel(sessions, totalDuration) {
  if (!sessions) return 'No recordings yet';
  return `${sessions} ${sessions === 1 ? 'session' : 'sessions'} · ${formatDuration(totalDuration)}`;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function formatEdited(iso, now = new Date()) {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime()) || now - then < 60_000) return 'just now';
  const days = Math.round((startOfDay(now) - startOfDay(then)) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

// What the revenue-share rows show: price x percent, to at most 2 decimals.
export function shareAmount(price, percent) {
  return Math.round(price * percent) / 100;
}

// ── Form values ─────────────────────────────────────────────────────────
// The form keeps numbers as digit strings so inputs can be cleared and retyped.
// Anything after a decimal point is dropped first, so a pasted "1500.50"
// reads as 1500 and not 150050.

export function digitsOnly(value, maxLength) {
  return String(value ?? '')
    .split('.')[0]
    .replace(/[^0-9]/g, '')
    .slice(0, maxLength);
}

export function toNumber(value) {
  return Number(digitsOnly(value)) || 0;
}

export function packToForm(pack) {
  const shares = pack?.shares ?? DEFAULT_SHARES;
  return {
    name: pack?.name ?? '',
    description: pack?.description ?? '',
    teacherId: pack?.teacherId != null ? String(pack.teacherId) : '',
    grade: pack?.grade ?? '',
    subject: pack?.subject ?? '',
    price: pack?.price ? String(pack.price) : '',
    validity: pack?.validity ?? '6m',
    customDays: pack?.customDays ? String(pack.customDays) : '90',
    shares: {
      teacher: String(shares.teacher),
      institute: String(shares.institute),
      system: String(shares.system),
    },
    // an existing cover's address, or a local preview of a file picked in this form
    coverUrl: pack?.coverUrl ?? null,
  };
}

// The fields the server stores. The cover file travels separately.
export function formToValues(form) {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    teacherId: form.teacherId,
    grade: form.grade,
    subject: form.subject,
    price: toNumber(form.price),
    validity: form.validity,
    customDays: form.validity === 'custom' ? toNumber(form.customDays) : undefined,
    shares: {
      teacher: toNumber(form.shares.teacher),
      institute: toNumber(form.shares.institute),
      system: toNumber(form.shares.system),
    },
  };
}

export const ERROR_MESSAGES = {
  name: 'Give the pack a name.',
  teacherId: 'Select a teacher.',
  grade: 'Select a grade.',
  subject: 'Select a subject.',
  price: 'Enter a price above zero.',
  validity: 'Enter the number of days.',
};

// Everything Save & publish needs. A draft only needs `errors.name` to be false.
// The same checks apply when saving a pack that is already published.
export function validatePack(form) {
  const price = toNumber(form.price);
  const total =
    toNumber(form.shares.teacher) + toNumber(form.shares.institute) + toNumber(form.shares.system);
  const errors = {
    name: !form.name.trim(),
    teacherId: !form.teacherId,
    grade: !form.grade,
    subject: !form.subject,
    price: !(price > 0),
    validity: form.validity === 'custom' && !(toNumber(form.customDays) > 0),
    shares: total !== 100,
  };
  const count = Object.values(errors).filter(Boolean).length;
  return { errors, count, price, total };
}

// Returns an error message for a cover file that can't be used, or '' if it is fine.
export function coverFileError(file) {
  if (!COVER_TYPES.includes(file.type)) {
    return 'Use a JPG, PNG or WebP image.';
  }
  if (file.size > LIMITS.coverMaxBytes) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return `This image is ${mb} MB. Please compress it so students on mobile data can load it quickly.`;
  }
  return '';
}
