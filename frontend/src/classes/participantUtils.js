import { PARTICIPANT_FILTERS, PARTICIPANT_METHODS } from './constants';
import { normalizePhone } from './studentUtils';

// Pure helpers for the students who attended a session: searching by phone number or barcode, and narrowing the
// list to online or physical attendance.

export const methodInfo = (method) => PARTICIPANT_METHODS[method] || PARTICIPANT_METHODS.online;

// What may be typed in the search box: letters and digits (barcodes), spaces, dashes and a +, at most 20 characters.
export const cleanParticipantQuery = (value) => String(value ?? '').replace(/[^A-Za-z\d+\s-]/g, '').slice(0, 20);

const codeOf = (value) => String(value ?? '').replace(/[\s-]+/g, '').toUpperCase();

// A phone number is searched by its digits ("77 123" and "+94 77 123" both find 0771234567), a barcode by its
// letters and digits ("syz2640" finds SYZ264007). Anything with letters in it is a barcode search only.
export function matchesQuery(participant, query) {
  const raw = String(query ?? '').trim();
  if (!raw) return true;
  if (codeOf(participant.barcode).includes(codeOf(raw))) return true;
  if (!/^[\d\s+-]+$/.test(raw)) return false;
  const digits = normalizePhone(raw);
  return !!digits && normalizePhone(participant.phone).includes(digits);
}

export const matchesMethod = (participant, method) => method === 'all' || participant.method === method;

export const filterParticipants = (participants, { method = 'all', query = '' } = {}) =>
  participants.filter((p) => matchesQuery(p, query) && matchesMethod(p, method));

// How many each dropdown option would show for the current search: { all, online, physical }.
export function methodCounts(participants, query = '') {
  const found = participants.filter((p) => matchesQuery(p, query));
  return Object.fromEntries(PARTICIPANT_FILTERS.map((f) => [f.value, found.filter((p) => matchesMethod(p, f.value)).length]));
}

// Earliest first: the order they came in.
export const sortByArrival = (participants) =>
  [...participants].sort((a, b) => String(a.attendedAt).localeCompare(String(b.attendedAt)) || String(a.name).localeCompare(String(b.name)));
