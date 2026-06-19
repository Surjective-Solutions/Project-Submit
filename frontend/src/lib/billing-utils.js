const MONTH_NAMES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

export function getCurrentMonthStatus(monthly_payments) {
  const now = new Date();
  return getMonthStatus(monthly_payments, now.getMonth() + 1, now.getFullYear());
}

export function getMonthStatus(monthly_payments, month, year) {
  if (!monthly_payments?.length) return 'NOT_PAID';
  const entry = monthly_payments.find((p) => p.month === month && p.year === year);
  return entry?.status ?? 'NOT_PAID';
}

export function isPaidMonth(monthly_payments, month, year) {
  return getMonthStatus(monthly_payments, month, year) === 'PAID';
}

export function getLastPaidMonth(monthly_payments) {
  if (!monthly_payments?.length) return null;
  const paid = monthly_payments
    .filter((p) => p.status === 'PAID')
    .sort((a, b) => a.year !== b.year ? b.year - a.year : b.month - a.month);
  return paid.length > 0 ? paid[0] : null;
}

export function formatMonthYear(month, year) {
  return new Date(year, month - 1, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
}

export function toMonthYearSlug(month, year) {
  return `${MONTH_NAMES[month - 1]}-${year}`;
}

export function parseMonthYearSlug(slug) {
  const lastDash = slug.lastIndexOf('-');
  const monthStr = slug.slice(0, lastDash).toLowerCase();
  const year = parseInt(slug.slice(lastDash + 1), 10);
  const month = MONTH_NAMES.indexOf(monthStr) + 1;
  return { month, year };
}
