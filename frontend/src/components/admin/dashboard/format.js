const numberFormat = new Intl.NumberFormat('en-US');

export const formatNumber = (n) => numberFormat.format(n);

export const formatLKR = (n) => `LKR ${numberFormat.format(n)}`;

export const percent = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0);

export function plural(n, singular, pluralForm = `${singular}s`) {
  return `${formatNumber(n)} ${n === 1 ? singular : pluralForm}`;
}

// 190 → "3h 10m", 52 → "52m"
export function formatWait(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}
