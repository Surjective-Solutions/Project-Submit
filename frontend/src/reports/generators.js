// Mock row generators. Each one takes { teachers, months, todayKey } and
// returns rows, newest first. Replace these with API calls later and keep
// the returned row shape (see config.js for the columns that read them).

import { daysInMonth, monthLabel, parseMonthKey } from './dates.js';
import { pick, randInt, seededRandom } from './random.js';

const pad = (n) => String(n).padStart(2, '0');

function classNames(teacher, year) {
  return [
    `${year} ${teacher.level} Theory — ${teacher.subject}`,
    `${year + 1} ${teacher.level} Theory — ${teacher.subject}`,
    `${year} Paper Class — ${teacher.subject}`,
  ];
}

// ── Class enrollments ─────────────────────────────────────────────────────────
// 3 classes per teacher per month.

export function generateClassEnrollmentRows({ teachers, months }) {
  const rows = [];
  for (const month of months) {
    const { year } = parseMonthKey(month);
    for (const teacher of teachers) {
      classNames(teacher, year).forEach((className, index) => {
        const rnd = seededRandom(`enrollments|${teacher.id}|${month}|${index}`);
        const enrolled = randInt(rnd, 38, 210);
        rows.push({
          monthKey: month,
          month: monthLabel(month),
          className,
          teacher: teacher.name,
          medium: teacher.medium,
          enrolled,
          newCount: randInt(rnd, 2, Math.max(3, Math.round(enrolled * 0.22))),
          dropped: randInt(rnd, 0, Math.max(1, Math.round(enrolled * 0.06))),
          paidPct: randInt(rnd, 68, 99),
        });
      });
    }
  }
  return rows;
}

// ── Class admission enrollments ───────────────────────────────────────────────
// One row per new admission. Dates are YYYY-MM-DD keys so they sort by real
// date; admissions that would fall after today are left out.

const FIRST_NAMES = [
  'Kavindu', 'Nethmi', 'Sahan', 'Tharushi', 'Dineth', 'Imasha', 'Ravindu', 'Sanduni',
  'Pasindu', 'Hiruni', 'Ashan', 'Nadeesha', 'Lakshan', 'Chamodi', 'Yohan', 'Anjali',
  'Mohamed', 'Aaliyah', 'Thushan', 'Kavitha',
];
const LAST_NAMES = [
  'Silva', 'Perera', 'Fernando', 'Jayawardena', 'Bandara', 'Rajapaksa', 'Dissanayake',
  'Wijesinghe', 'Gunasekara', 'Senanayake', 'Rizvi', 'Sivakumar', 'Herath', 'Karunaratne',
  'Amarasinghe', 'Liyanage',
];
const PAYMENT_METHODS = ['Bank slip', 'Genie', 'Card', 'FriMi', 'Cash'];

export function generateAdmissionRows({ teachers, months, from, to, todayKey }) {
  const rows = [];
  for (const month of months) {
    const { year } = parseMonthKey(month);
    const totalDays = daysInMonth(month);
    for (const teacher of teachers) {
      const rnd = seededRandom(`admissions|${teacher.id}|${month}`);
      const count = randInt(rnd, 5, 12);
      const classes = classNames(teacher, year);
      for (let i = 0; i < count; i += 1) {
        const dateKey = `${month}-${pad(randInt(rnd, 1, totalDays))}`;
        const first = pick(rnd, FIRST_NAMES);
        const last = pick(rnd, LAST_NAMES);
        const studentId = `STU-${String(year).slice(2)}-${randInt(rnd, 1000, 9999)}`;
        const className = pick(rnd, classes);
        const paidVia = pick(rnd, PAYMENT_METHODS);
        if (todayKey && dateKey > todayKey) continue;
        if ((from && dateKey < from) || (to && dateKey > to)) continue;  
        rows.push({
          dateKey,
          studentId,
          student: `${first} ${last}`,
          className,
          teacher: teacher.name,
          fee: teacher.level === 'O/L' ? 750 : 1000,
          paidVia,
        });
      }
    }
  }
  return rows.sort(
    (a, b) => b.dateKey.localeCompare(a.dateKey) || a.studentId.localeCompare(b.studentId),
  );
}

// ── Study pack purchases ──────────────────────────────────────────────────────
// 2 packs per teacher per month.

export function generateStudyPackRows({ teachers, months }) {
  const rows = [];
  for (const month of months) {
    for (const teacher of teachers) {
      const price = teacher.level === 'O/L' ? 1200 : 1500;
      ['Theory', 'Revision'].forEach((kind, index) => {
        const rnd = seededRandom(`packs|${teacher.id}|${month}|${index}`);
        const bought = randInt(rnd, 30, 180);
        const delivered = bought - randInt(rnd, 0, Math.round(bought * 0.15));
        rows.push({
          monthKey: month,
          month: monthLabel(month),
          pack: `${teacher.subject} ${kind} Tute Pack`,
          teacher: teacher.name,
          bought,
          delivered,
          returned: randInt(rnd, 0, Math.round(delivered * 0.05)),
          revenue: bought * price,
        });
      });
    }
  }
  return rows;
}
