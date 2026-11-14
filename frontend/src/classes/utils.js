import { ALL, CLASS_TYPES, CLASSES_ROUTE, HONORIFICS, LEVELS, PACKAGE } from './constants';

// Pure helpers for the Classes section: filtering, counting, grouping and formatting.

export function tutorHref(id) {
  return `${CLASSES_ROUTE}/tutors/${encodeURIComponent(id)}`;
}

export function classHref(tutorId, classId) {
  return `${CLASSES_ROUTE}/tutors/${encodeURIComponent(tutorId)}/classes/${encodeURIComponent(classId)}`;
}

export function plural(count, one, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}

// "Mr. Nuwan Perera" -> "NP". Titles such as Mr. and Dr. are skipped.
export function initialsOf(name) {
  const words = String(name || '')
    .trim()
    .split(/\s+/)
    .filter((word) => word && !HONORIFICS.includes(word.replace(/\./g, '').toLowerCase()));
  if (!words.length) return '?';
  const first = [...words[0]][0];
  const last = words.length > 1 ? [...words[words.length - 1]][0] : '';
  return (first + last).toUpperCase();
}

// "0771234567" -> "077 123 4567"; anything else is shown as it is.
export function formatPhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (/^0\d{9}$/.test(digits)) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  return String(value ?? '').trim();
}

// ── Tutor directory ─────────────────────────────────────────────────────────

export function matchesQuery(tutor, query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return true;
  return `${tutor.name} ${tutor.subject}`.toLowerCase().includes(q);
}

export function filterTutors(tutors, { query = '', level = ALL } = {}) {
  return tutors.filter((t) => matchesQuery(t, query) && (level === ALL || t.level === level));
}

// How many tutors each tab would show for the current search: { all, 'A/L', 'O/L' }.
export function levelCounts(tutors, query = '') {
  const found = tutors.filter((t) => matchesQuery(t, query));
  const counts = { [ALL]: found.length };
  for (const level of LEVELS) counts[level] = found.filter((t) => t.level === level).length;
  return counts;
}

export function totals(tutors) {
  return {
    tutors: tutors.length,
    classes: tutors.reduce((sum, t) => sum + (t.classCount || 0), 0),
  };
}

// ── Classes of one tutor ────────────────────────────────────────────────────

export const batchKey = (cls) => `${cls.batchYear} ${cls.level}`;

// Batches present in the data, oldest exam year first (A/L before O/L within a year).
export function batchOptions(classes) {
  const seen = new Map();
  for (const cls of classes) if (!seen.has(batchKey(cls))) seen.set(batchKey(cls), cls);
  return [...seen.values()]
    .sort((a, b) => a.batchYear - b.batchYear || LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level))
    .map((cls) => ({ key: batchKey(cls), label: batchKey(cls) }));
}

export function applyFilters(classes, { batch = ALL, type = ALL } = {}) {
  return classes.filter((c) => (batch === ALL || batchKey(c) === batch) && (type === ALL || c.type === type));
}

// Each batch button counts the classes it would show under the chosen type, and each type button
// counts the classes it would show under the chosen batch.
export function batchCounts(classes, type) {
  const counts = { [ALL]: 0 };
  for (const c of applyFilters(classes, { type })) {
    counts[ALL] += 1;
    counts[batchKey(c)] = (counts[batchKey(c)] || 0) + 1;
  }
  return counts;
}

export function typeCounts(classes, batch) {
  const counts = { [ALL]: 0 };
  for (const type of CLASS_TYPES) counts[type] = 0;
  for (const c of applyFilters(classes, { batch })) {
    counts[ALL] += 1;
    counts[c.type] = (counts[c.type] || 0) + 1;
  }
  return counts;
}

const typeRank = (type) => {
  const index = CLASS_TYPES.indexOf(type);
  return index < 0 ? CLASS_TYPES.length : index;
};

export const isPackage = (item) => !!item && item.type === PACKAGE;

// Groups by batch, newest exam year first, and sorts each group Theory, Paper, Revision, then packages.
// Students are counted from the classes only (a package is a bundle of classes, not extra students).
export function groupByBatch(classes) {
  const groups = new Map();
  for (const cls of classes) {
    const key = batchKey(cls);
    if (!groups.has(key)) groups.set(key, { key, year: cls.batchYear, level: cls.level, classes: [] });
    groups.get(key).classes.push(cls);
  }
  return [...groups.values()]
    .sort((a, b) => b.year - a.year || LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level))
    .map((group) => ({
      ...group,
      classes: [...group.classes].sort(
        (a, b) => typeRank(a.type) - typeRank(b.type) || String(a.title).localeCompare(String(b.title)),
      ),
      classCount: group.classes.filter((c) => !isPackage(c)).length,
      packageCount: group.classes.filter(isPackage).length,
      students: group.classes.reduce((sum, c) => sum + (isPackage(c) ? 0 : c.enrolledCount || 0), 0),
    }));
}

// "2 classes · 1 package · 111 students"; a part is left out when it is zero.
export function groupSummary(group) {
  return [
    group.classCount > 0 && plural(group.classCount, 'class', 'classes'),
    group.packageCount > 0 && plural(group.packageCount, 'package'),
    group.students > 0 && plural(group.students, 'student'),
  ]
    .filter(Boolean)
    .join(' · ');
}

// The numbers on the profile card (packages are not classes, so they are not counted).
export function tutorStats(tutor, classes) {
  const real = classes.filter((c) => !isPackage(c));
  return {
    classes: real.length,
    students: real.reduce((sum, c) => sum + (c.enrolledCount || 0), 0),
  };
}

// The classes a package bundles, looked up in the tutor's full class list, with what they cost separately
// and how much the package saves. `regularFee`/`saving` are only given when every included class is found
// and the package really is cheaper.
export function packageDetails(pkg, allClasses) {
  const ids = Array.isArray(pkg.classIds) ? pkg.classIds : [];
  const items = ids
    .map((id) => allClasses.find((c) => c.id === id && !isPackage(c)))
    .filter(Boolean)
    .sort((a, b) => typeRank(a.type) - typeRank(b.type));
  const complete = items.length > 0 && items.length === ids.length;
  const regular = complete ? items.reduce((sum, c) => sum + payablePrice(c), 0) : 0;
  const price = Number(pkg.monthlyFee);
  const saving = complete && Number.isFinite(price) && regular > price ? regular - price : 0;
  return { items, regularFee: saving > 0 ? regular : null, saving };
}

// ── Class card text ─────────────────────────────────────────────────────────

// "14:00" -> "2:00 PM"
export function formatTime(value) {
  const match = /^(\d{1,2}):(\d{2})/.exec(String(value || ''));
  if (!match) return '';
  const hours = Number(match[1]);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  return `${hours % 12 || 12}:${match[2]} ${suffix}`;
}

export function scheduleText(cls) {
  const range = [formatTime(cls.startTime), formatTime(cls.endTime)].filter(Boolean).join(' – ');
  return [cls.day, range].filter(Boolean).join(' · ');
}

export function modeText(cls) {
  if (cls.mode === 'online') return 'Online only';
  return ['Hall + live stream', cls.hall].filter(Boolean).join(' · ');
}

export function formatLkr(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return '';
  return `LKR ${value.toLocaleString('en-US')}`;
}

// What a class costs a student: its price, or the special price when the teacher has given one.
// (Older data only has monthlyFee, which is the price.)
export const usualPrice = (cls) => Number(cls.price ?? cls.monthlyFee) || 0;
export function payablePrice(cls) {
  const usual = usualPrice(cls);
  const special = Number(cls.specialPrice);
  return special > 0 && special < usual ? special : usual;
}
export const hasSpecialPrice = (cls) => payablePrice(cls) < usualPrice(cls);

const FEE_UNIT = { daily: '/ day', monthly: '/ month', 'one-time': 'one-time' };

// "LKR 3,500 / month", "LKR 300 / day" or "LKR 25,000 one-time"
export function feeText(amount, format = 'monthly') {
  const text = formatLkr(amount);
  return text ? `${text} ${FEE_UNIT[format] || FEE_UNIT.monthly}` : '';
}

export function formatFee(amount) {
  const text = formatLkr(amount);
  return text ? `${text} / month` : '';
}

// The medium goes in brackets only when the tutor teaches in more than one.
export function classTitle(cls, tutor) {
  return tutor && (tutor.mediums || []).length > 1 && cls.medium ? `${cls.title} (${cls.medium})` : cls.title;
}
