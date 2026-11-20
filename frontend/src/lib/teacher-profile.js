// Reading a teacher's profile for the My account page and the Edit profile dialog, so both show the same things.

export const filled = (v) =>
  Array.isArray(v) ? v.length > 0 : typeof v === 'string' ? v.trim() !== '' : v != null && v !== '';

export function formatMemberSince(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// The first key that has a value wins, so a differently named column on the backend only needs adding to its list.
const pick = (t, keys) => {
  for (const k of keys) if (filled(t?.[k])) return String(t[k]);
  return '';
};

// The languages the teacher teaches in, as a list, whether the profile holds a list or a "Sinhala, English" string.
export const readMediums = (t) => {
  const m = t?.mediums ?? t?.medium;
  if (Array.isArray(m)) return m.filter(Boolean);
  return typeof m === 'string' ? m.split(/[,/]/).map((x) => x.trim()).filter(Boolean) : [];
};

// The values a teacher can't change themselves.
export const readOnlyValues = (t) => ({
  tutor_id: pick(t, ['tutor_id', 'tutorId', 'id']),
  contact_number: pick(t, ['contact_number', 'contactNumber', 'phone']),
  subject_area: pick(t, ['subject_area', 'subject']),
  exam_level: pick(t, ['exam_level', 'examLevel', 'level']),
  username: pick(t, ['username']),
  member_since: formatMemberSince(t?.created_at ?? t?.createdAt),
});
