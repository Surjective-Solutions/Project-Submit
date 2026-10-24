// Study Packs API — stubbed with an in-memory store until the backend exists.
//
// Every function returns a Promise and throws an Error (with a message that is safe to show
// to the admin) on failure, so the pages never need to change when real calls replace these.
//
// Planned endpoints (admin-only, via protectedRequestPath):
//   GET    /api/study-pack/get-all
//   POST   /api/study-pack/create        multipart: pack JSON (with items) + optional cover file
//   PUT    /api/study-pack/update/{id}   multipart: pack JSON (with items) + optional cover file
//
// The server must repeat every rule the page checks, because the page can be bypassed:
//   - the caller is an admin
//   - name is present; a draft needs nothing else
//   - publishing (and saving a pack that is already published) needs teacher, grade, subject,
//     price > 0, valid custom days, revenue shares totalling exactly 100, and at least one session
//   - every item's recordingCode exists in Class Recordings, appears once, and has a non-empty title
//   - `order`, `sessions` and `totalDuration` are computed on the server, not trusted from the page
//   - the cover is JPG, PNG or WebP and under 2 MB (check the file contents, not only the name)
//
// Study packs never copy video files. A session only stores a link (recordingCode) to a recording.

import { SEED_PACKS, SEED_TEACHERS } from './mockData';
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

export function getTeachers() {
  return respond(SEED_TEACHERS);
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

// Creates a pack (id null) or updates one, together with its sessions, in one request.
// `values` comes from formToValues(); `items` is [{ recordingCode, title, order }].
// Returns the full saved pack.
export async function savePackWithSessions({ id, values, items, coverFile, removeCover }, { publish }) {
  await wait();

  if (!values.name?.trim()) throw new Error('Give the pack a name.');
  if (items.some((item) => !item.title?.trim())) {
    throw new Error('Every session needs a lesson title so students know which topic it covers.');
  }
  if (new Set(items.map((item) => item.recordingCode)).size !== items.length) {
    throw new Error('A recording can only be added to a pack once.');
  }
  const recordings = items.map((item) => findRecording(item.recordingCode));
  if (recordings.some((recording) => !recording)) {
    throw new Error('One of the recordings could not be found. Remove it and add it again.');
  }
  if (publish && items.length === 0) {
    throw new Error('A pack needs at least one session before it can be published.');
  }

  const existing = id ? store.packs.find((p) => String(p.id) === String(id)) : null;
  if (id && !existing) throw new Error('This study pack no longer exists.');

  let coverUrl = existing?.coverUrl ?? null;
  if (coverFile) coverUrl = await fileToDataUrl(coverFile);
  else if (removeCover) coverUrl = null;

  const saved = {
    ...(existing ?? {}),
    ...values,
    id: existing ? existing.id : nextId(),
    coverUrl,
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

  store.packs = existing ? store.packs.map((p) => (p === existing ? saved : p)) : [saved, ...store.packs];
  return clone(saved);
}
