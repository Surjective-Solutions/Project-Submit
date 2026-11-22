// Study Packs API, wired to the backend:
//
//   GET  /api/study-pack/list                 every pack with its sessions (a teacher's token gets only their own)
//   POST /api/study-pack/create               admin: a new pack ("Save & publish" puts it on sale, otherwise a draft)
//   POST /api/study-pack/create-mine          teacher: a new pack, always a draft
//   PUT  /api/study-pack/update/{id}          admin: change a pack
//   PUT  /api/study-pack/update-mine/{id}     teacher: change one of their own packs (status and revenue split stay)
//   GET  /api/study-pack/classes?tutorId=     the classes of a teacher (the Class dropdown)
// The saves are multipart: the form fields, an `items` JSON array of sessions, and an optional `cover` image.
//
// Every function returns a Promise and throws an Error (with a message that is safe to show on screen) on failure.
//
// The server repeats every rule the form checks, because the page can be bypassed: it owns the order of the sessions,
// re-checks the name, the publish fields, the revenue shares, duplicate and unknown recordings, empty lesson titles and
// the cover's type and size, and takes each session's title, date and length from the saved recording.
//
// Study packs never copy video files. A session only stores a link (recordingCode) to a recording.

import {
  API_BASE,
  createMyStudyPack,
  createStudyPack,
  getStudyPackClasses,
  getStudyPacks,
  getTutors,
  updateMyStudyPack,
  updateStudyPack,
} from '@/lib/api-client';

// A pack as the pages use it, from what the server sends.
function toPack(row) {
  return {
    id: String(row.id),
    name: row.name,
    description: row.description ?? '',
    teacherId: row.teacherId != null ? String(row.teacherId) : '',
    classId: row.classId != null ? String(row.classId) : '',
    className: row.className ?? '',
    grade: row.grade ?? '',
    subject: row.subject ?? '',
    price: row.price ?? 0,
    validity: row.validity,
    customDays: row.customDays ?? undefined,
    shares: row.shares,
    // the server sends the cover as a path on itself
    coverUrl: row.coverUrl ? `${API_BASE}${row.coverUrl}` : null,
    status: row.status,
    sessions: row.sessions ?? 0,
    totalDuration: row.totalDuration ?? 0,
    sold: row.sold ?? 0,
    updatedAt: row.updatedAt,
    items: (row.items ?? []).map((item) => ({
      recordingCode: item.recordingCode,
      title: item.title,
      order: item.order,
      recording: item.recording,
    })),
  };
}

export async function getPacks() {
  const rows = await getStudyPacks();
  return (Array.isArray(rows) ? rows : []).map(toPack);
}

// The teacher list the Class section picks from. These are real tutors, because a pack is
// saved against a tutorSeq the backend looks up — a made-up id is refused.
export async function getTeachers() {
  const tutors = await getTutors();
  if (!Array.isArray(tutors)) return [];
  return tutors
    .filter((tutor) => tutor.status === 2)
    .map((tutor) => ({
      id: String(tutor.id),
      name: tutor.displayName || tutor.teacher_name || '',
      subject: tutor.subject || '',
    }));
}

// The classes of one teacher, for the Class dropdown: [{ id, name, subject }]. Only that teacher's active classes
// come back; in the teacher account the server ignores the id and answers for the signed-in teacher.
export async function getClasses(teacherId) {
  if (!teacherId) return [];
  const classes = await getStudyPackClasses(teacherId);
  if (!Array.isArray(classes)) return [];
  return classes.map((c) => ({ id: String(c.id), name: c.name || '', subject: c.subject || '' }));
}

// The sessions of a pack, each with its recording attached (the page shows date and duration). The server sends them
// with the pack.
export function getPackItems(pack) {
  return (pack.items ?? []).map((item, index) => ({
    recordingCode: item.recordingCode,
    title: item.title,
    order: item.order ?? index + 1,
    recording: item.recording,
  }));
}

// The checks the page can make on its own, so a mistake is caught before the request goes out.
// The server makes all of them again.
function checkBeforeSending({ values, items }, { publish }) {
  if (!values.name?.trim()) throw new Error('Give the pack a name.');
  if (items.some((item) => !item.title?.trim())) {
    throw new Error('Every session needs a lesson title so students know which topic it covers.');
  }
  if (new Set(items.map((item) => item.recordingCode)).size !== items.length) {
    throw new Error('A recording can only be added to a pack once.');
  }
  if (publish && items.length === 0) {
    throw new Error('A pack needs at least one session before it can be published.');
  }
}

// The sessions as the server reads them: the recording's code and the lesson title. The server owns the order and
// looks up each recording's own title, date and length.
function itemsPayload(items) {
  return items.map((item, index) => ({
    recordingCode: item.recordingCode,
    title: item.title.trim(),
    order: index + 1,
  }));
}

function buildFormData({ values, items, coverFile, removeCover }, { publish }) {
  const body = new FormData();

  body.append('name', values.name);
  body.append('description', values.description);
  if (values.teacherId) body.append('teacher_id', values.teacherId);
  if (values.classId) body.append('class_id', values.classId);
  body.append('grade', values.grade);
  body.append('subject', values.subject);
  body.append('price', String(values.price));
  body.append('validity', values.validity);
  if (values.customDays != null) body.append('custom_days', String(values.customDays));
  body.append('teacher_share', String(values.shares.teacher));
  body.append('institute_share', String(values.shares.institute));
  body.append('system_share', String(values.shares.system));
  body.append('publish', String(Boolean(publish)));
  body.append('remove_cover', String(Boolean(removeCover)));
  body.append('items', JSON.stringify(itemsPayload(items)));

  if (coverFile) body.append('cover', coverFile);

  return body;
}

// Creates a pack (id null) or updates one, together with its sessions, in one request.
// `values` comes from formToValues(); `items` is the session list from step 2.
// `mine` is set in the teacher account: the server then saves the pack as that teacher's own (a new one is a draft).
// Returns the full saved pack.
export async function savePackWithSessions({ id, values, items, coverFile, removeCover }, { publish, mine = false }) {
  checkBeforeSending({ values, items }, { publish });

  const body = buildFormData({ values, items, coverFile, removeCover }, { publish });
  let response;
  if (id) {
    response = await (mine ? updateMyStudyPack : updateStudyPack)(id, body);
  } else {
    response = await (mine ? createMyStudyPack : createStudyPack)(body);
  }

  if (!response?.isSuccess || !response.pack) {
    throw new Error(response?.message || 'Could not save the study pack. Please try again.');
  }
  return toPack(response.pack);
}
