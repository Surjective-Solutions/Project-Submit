import { EARLIEST_DATE, formatDate, monthRange } from './dates.js';

// Turns the From / To dates (YYYY-MM-DD strings, '' when empty) into what the
// report needs:
//   { valid, error, from, to, months (newest first), label, slug }
//
// While either date is still empty the result is { valid: false, error: null },
// so the page can show a prompt instead of an error.
export function resolvePeriod({ from, to }, todayKey) {
  const invalid = (error) => ({ valid: false, error, from, to, months: [], label: '', slug: '' });

  if (!from || !to) return invalid(null);
  if (to < from) return invalid('“To” date must be the same as or after “From”.');
  if (to > todayKey) return invalid('Dates can’t be in the future.');
  if (from < EARLIEST_DATE) return invalid(`Dates before ${formatDate(EARLIEST_DATE)} aren’t available.`);

  return {
    valid: true,
    error: null,
    from,
    to,
    months: monthRange(from.slice(0, 7), to.slice(0, 7)),
    label: from === to ? formatDate(from) : `${formatDate(from)} – ${formatDate(to)}`,
    slug: from === to ? from : `${from}_to_${to}`,
  };
}