// Study Packs API.
//
// Creating a pack is wired to the backend:
//   POST /api/study-pack/create   multipart: the form fields, an `items` JSON array of
//                                 sessions, and an optional `cover` image
//
// Nothing else is. There is no list, update or delete endpoint yet, so getPacks() still
// serves the sample packs from an in-memory store and editing a saved pack still only
// changes that store. When those endpoints arrive, replace the stubbed functions below and
// drop the local bookkeeping marked "until the list endpoint exists".
//
// Every function returns a Promise and throws an Error (with a message that is safe to show
// to the admin) on failure, so the pages never need to change when real calls replace these.
//
// The server repeats every rule the create page checks, because the page can be bypassed:
// it owns `order`, re-checks the name, the publish fields, the revenue shares, duplicate
// recordings, empty lesson titles, and the cover's type and size.
//
// Study packs never copy video files. A session only stores a link (recordingCode) to a
// recording, plus a copy of that recording's title, date and length.

import { createStudyPack, getTutors } from '@/lib/api-client';
import { SEED_PACKS } from './mockData';
import { findRecording, listRecordingsFor } from './mockRecordings';

const LATENCY_MS = 250;

const clone = (value) => JSON.parse(JSON.stringify(value));

const store = { packs: clone(SEED_PACKS) };

function respond(value) {
  return new Promise((resolve) => setTimeout(() => resolve(clone(value)), LATENCY_MS));
}

function wait() {
  return new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
}

function nextId() {
  return String(Math.max(0, ...store.packs.map((p) => Number(p.id) || 0)) + 1);
}

// Mock only: the real server stores the file and returns its address.
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read the cover image. Please try another file.'));
    reader.readAsDataURL(file);
  });
}

export function getPacks() {
  return respond(store.packs);
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

// The sessions of a pack, each with its recording attached (the page shows date and duration).
// Mock: packs that were never saved with sessions get the oldest recordings of their teacher
// and subject, so the sample packs have something to edit. A real list endpoint would return
// the items (with their recordings) together with each pack.
export function getPackItems(pack) {
  if (Array.isArray(pack.items)) {
    return pack.items
      .map((item, index) => ({
        recordingCode: item.recordingCode,
        title: item.title,
        order: index + 1,
        recording: findRecording(item.recordingCode),
      }))
      .filter((item) => item.recording);
  }
  return listRecordingsFor(pack.teacherId, pack.subject)
    .slice(0, pack.sessions || 0)
    .map((recording, index) => ({
      recordingCode: recording.code,
      title: recording.title,
      order: index + 1,
      recording,
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
  if (items.some((item) => !findRecording(item.recordingCode))) {
    throw new Error('One of the recordings could not be found. Remove it and add it again.');
  }
  if (publish && items.length === 0) {
    throw new Error('A pack needs at least one session before it can be published.');
  }
}

// The sessions as the server reads them. Each one carries a copy of its recording's title,
// date and length, which the server stores beside the code. The recordings come from the
// Class Recordings stub for now; once that has a backend the server looks them up itself.
function itemsPayload(items) {
  return items.map((item, index) => {
    const recording = findRecording(item.recordingCode);
    return {
      recordingCode: item.recordingCode,
      title: item.title.trim(),
      order: index + 1,
      recordingTitle: recording?.title ?? null,
      classDate: recording?.classDate ?? null,
      durationMins: recording?.durationMins ?? 0,
      medium: recording?.medium ?? null,
    };
  });
}

function buildFormData({ values, items, coverFile }, { publish }) {
  const body = new FormData();

  body.append('name', values.name);
  body.append('description', values.description);
  if (values.teacherId) body.append('teacher_id', values.teacherId);
  body.append('grade', values.grade);
  body.append('subject', values.subject);
  body.append('price', String(values.price));
  body.append('validity', values.validity);
  if (values.customDays != null) body.append('custom_days', String(values.customDays));
  body.append('teacher_share', String(values.shares.teacher));
  body.append('institute_share', String(values.shares.institute));
  body.append('system_share', String(values.shares.system));
  body.append('publish', String(Boolean(publish)));
  body.append('items', JSON.stringify(itemsPayload(items)));

  if (coverFile) body.append('cover', coverFile);

  return body;
}

// Creates a pack (id null) or updates one, together with its sessions, in one request.
// `values` comes from formToValues(); `items` is the session list from step 2.
// Returns the full saved pack.
export async function savePackWithSessions({ id, values, items, coverFile, removeCover }, { publish }) {
  checkBeforeSending({ values, items }, { publish });

  if (!id) {
    return createPack({ values, items, coverFile }, { publish });
  }
  return updatePackInStore({ id, values, items, coverFile, removeCover }, { publish });
}

async function createPack({ values, items, coverFile }, { publish }) {
  const response = await createStudyPack(buildFormData({ values, items, coverFile }, { publish }));

  if (!response?.isSuccess) {
    throw new Error(response?.message || 'Could not create the study pack. Please try again.');
  }

  // Until the list endpoint exists the page's list is local, so the pack it just sent is
  // added from what was sent. The id and the cover address are placeholders: a reload drops
  // this pack from the list, even though the backend has it.
  const saved = buildPack({ existing: null, values, items, publish });
  saved.id = nextId();
  saved.coverUrl = coverFile ? await fileToDataUrl(coverFile) : null;

  store.packs = [saved, ...store.packs];
  return clone(saved);
}

// Stubbed: there is no update endpoint, so an edit only changes the in-memory store.
async function updatePackInStore({ id, values, items, coverFile, removeCover }, { publish }) {
  await wait();

  const existing = store.packs.find((p) => String(p.id) === String(id));
  if (!existing) throw new Error('This study pack no longer exists.');

  const saved = buildPack({ existing, values, items, publish });
  saved.id = existing.id;

  if (coverFile) saved.coverUrl = await fileToDataUrl(coverFile);
  else if (removeCover) saved.coverUrl = null;
  else saved.coverUrl = existing.coverUrl ?? null;

  store.packs = store.packs.map((p) => (p === existing ? saved : p));
  return clone(saved);
}

// The pack as the list shows it, counted the same way the server counts it.
function buildPack({ existing, values, items, publish }) {
  const recordings = items.map((item) => findRecording(item.recordingCode));
  return {
    ...(existing ?? {}),
    ...values,
    status: publish || existing?.status === 'published' ? 'published' : 'draft',
    items: items.map((item, index) => ({
      recordingCode: item.recordingCode,
      title: item.title.trim(),
      order: index + 1,
    })),
    sessions: items.length,
    totalDuration: recordings.reduce((sum, recording) => sum + recording.durationMins, 0),
    updatedAt: new Date().toISOString(),
  };
}
