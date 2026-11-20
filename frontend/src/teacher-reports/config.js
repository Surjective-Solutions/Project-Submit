// Reports for the teacher account: the admin report types (reports/config.js) limited to the signed-in teacher.
//   - the Teacher column is dropped (every row is the teacher's own)
//   - there is no "All teachers" and no teacher picker
//   - the third tile of "Class admission enrollments" counts classes instead of teachers
// Row generators are the admin ones for now (mock data). When real endpoints exist, swap them for calls that return
// the same row shapes for the signed-in teacher only.

import { REPORT_TYPES as ADMIN_REPORT_TYPES } from '@/reports/config';
import { parseExamLevels } from '@/study-packs/examLevel';

const number = (n) => Number(n).toLocaleString('en-US');

const DESCRIPTIONS = {
  'class-enrollments': 'Students enrolled in each of your classes per month: new, dropped and paid.',
  'class-admissions': 'New admissions to your classes, with admission fee and payment method.',
  'study-packs': 'Your study packs bought, delivered and revenue per month.',
};

export const REPORT_TYPES = ADMIN_REPORT_TYPES.map((type) => {
  const mine = {
    ...type,
    description: DESCRIPTIONS[type.key] ?? type.description,
    columns: type.columns.filter((column) => column.key !== 'teacher'),
  };
  if (type.key === 'class-admissions') {
    mine.totals = (rows) => [
      ...type.totals(rows).slice(0, 2),
      { label: 'Classes', value: number(new Set(rows.map((row) => row.className)).size) },
    ];
  }
  return mine;
});

export function getReportType(key) {
  return REPORT_TYPES.find((type) => type.key === key) ?? null;
}

// The signed-in teacher (from getMe() in study-packs/teacherApi.js) in the shape the row generators expect.
export function reportTeacher(me) {
  return {
    id: me.id,
    name: me.name,
    subject: me.subject || 'Your subject',
    level: parseExamLevels(me.examLevel)[0] ?? 'A/L',
    medium: (me.mediums ?? []).join(', ') || '—',
  };
}
