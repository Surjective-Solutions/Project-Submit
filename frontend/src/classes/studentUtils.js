import { STUDENT_FILTERS, STUDENT_STATUS } from './constants';

// Pure helpers for the students of a class: searching by phone number and filtering by payment.

export const statusInfo = (status) => STUDENT_STATUS[status] || STUDENT_STATUS.unpaid;

// What may be typed in the search box: digits, spaces, dashes and a leading +.
export const cleanPhoneQuery = (value) => String(value ?? '').replace(/[^\d+\s-]/g, '').slice(0, 20);

// Phone numbers compared as digits with the local leading 0: "+94 77 123 4567" and "0771234567" are the same.
export function normalizePhone(value) {
  const raw = String(value ?? '').trim();
  let digits = raw.replace(/\D/g, '');
  if (raw.startsWith('+94') || raw.startsWith('0094')) digits = `0${digits.replace(/^(0094|94)/, '')}`;
  return digits;
}

export function matchesPhone(student, query) {
  const q = normalizePhone(query);
  if (!q) return true;
  return normalizePhone(student.phone).includes(q);
}

// "all" shows everyone; "paid" those who paid this month; "free" the free enrollments.
export function matchesFilter(student, filter) {
  return filter === 'all' || student.status === filter;
}

export const filterStudents = (students, { filter = 'all', query = '' } = {}) =>
  students.filter((student) => matchesPhone(student, query) && matchesFilter(student, filter));

// How many students each filter button would show for the current search: { all, paid, free }.
export function filterCounts(students, query = '') {
  const found = students.filter((student) => matchesPhone(student, query));
  return Object.fromEntries(STUDENT_FILTERS.map((f) => [f.value, found.filter((s) => matchesFilter(s, f.value)).length]));
}
