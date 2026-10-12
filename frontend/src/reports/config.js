// Report types. To add a new one, append an entry here:
//   key / slug      identifiers (slug is used in download file names)
//   title / description / icon   shown on the Step 1 card
//   columns         [{ key, label, numeric?, format?(value, row) }]
//                   `format` is for the on-screen table only; CSV uses raw values
//   generateRows    ({ teachers, months, todayKey }) => rows  (swap for an API call)
//   totals          (rows) => [{ label, value }]  (the three tiles)

import { formatDate } from './dates.js';
import {
  generateAdmissionRows,
  generateClassEnrollmentRows,
  generateStudyPackRows,
} from './generators.js';

const number = (n) => Number(n).toLocaleString('en-US');
const sum = (rows, key) => rows.reduce((total, row) => total + row[key], 0);

// 845,000 stays as is; 1,240,000 becomes 1.24M
function compactMoney(n) {
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)}M` : number(n);
}

export const REPORT_TYPES = [
  {
    key: 'class-enrollments',
    slug: 'class-enrollments',
    title: 'Class enrollments',
    description: 'Students enrolled in each class per month: new, dropped and paid.',
    icon: 'groups',
    granularity: 'month',
    columns: [
      { key: 'month', label: 'Month' },
      { key: 'className', label: 'Class' },
      { key: 'teacher', label: 'Teacher' },
      { key: 'medium', label: 'Medium' },
      { key: 'enrolled', label: 'Enrolled', numeric: true, format: number },
      { key: 'newCount', label: 'New', numeric: true, format: number },
      { key: 'dropped', label: 'Dropped', numeric: true, format: number },
      { key: 'paidPct', label: 'Paid %', numeric: true, format: (v) => `${v}%` },
    ],
    generateRows: generateClassEnrollmentRows,
    totals: (rows) => {
      const enrolled = sum(rows, 'enrolled');
      const weightedPaid = rows.reduce((total, r) => total + r.paidPct * r.enrolled, 0);
      return [
        { label: 'Total enrollments', value: number(enrolled) },
        { label: 'New this period', value: number(sum(rows, 'newCount')) },
        { label: 'Average paid', value: enrolled ? `${Math.round(weightedPaid / enrolled)}%` : '—' },
      ];
    },
  },
  {
    key: 'class-admissions',
    slug: 'class-admission-enrollments',
    title: 'Class admission enrollments',
    description: 'New admissions to a class, with admission fee and payment method.',
    icon: 'how_to_reg',
    granularity: 'day',
    columns: [
      { key: 'dateKey', label: 'Date', format: formatDate },
      { key: 'studentId', label: 'Student ID' },
      { key: 'student', label: 'Student' },
      { key: 'className', label: 'Class' },
      { key: 'teacher', label: 'Teacher' },
      { key: 'fee', label: 'Fee', numeric: true, format: (v) => `LKR ${number(v)}` },
      { key: 'paidVia', label: 'Paid via' },
    ],
    generateRows: generateAdmissionRows,
    totals: (rows) => [
      { label: 'New admissions', value: number(rows.length) },
      { label: 'Admission fees (LKR)', value: compactMoney(sum(rows, 'fee')) },
      { label: 'Teachers', value: number(new Set(rows.map((r) => r.teacher)).size) },
    ],
  },
  {
    key: 'study-packs',
    slug: 'study-pack-purchases',
    title: 'Study pack purchases',
    description: 'Monthly tute packs bought, delivered and revenue, per teacher.',
    icon: 'inventory_2',
    granularity: 'month',
    columns: [
      { key: 'month', label: 'Month' },
      { key: 'pack', label: 'Study pack' },
      { key: 'teacher', label: 'Teacher' },
      { key: 'bought', label: 'Bought', numeric: true, format: number },
      { key: 'delivered', label: 'Delivered', numeric: true, format: number },
      { key: 'returned', label: 'Returned', numeric: true, format: number },
      { key: 'revenue', label: 'Revenue', numeric: true, format: (v) => `LKR ${number(v)}` },
    ],
    generateRows: generateStudyPackRows,
    totals: (rows) => {
      const bought = sum(rows, 'bought');
      const delivered = sum(rows, 'delivered');
      return [
        { label: 'Packs bought', value: number(bought) },
        { label: 'Delivered %', value: bought ? `${((delivered / bought) * 100).toFixed(1)}%` : '—' },
        { label: 'Revenue (LKR)', value: compactMoney(sum(rows, 'revenue')) },
      ];
    },
  },
];

export function getReportType(key) {
  return REPORT_TYPES.find((type) => type.key === key) ?? null;
}
