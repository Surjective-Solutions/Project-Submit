// Study Packs API: a mock for now, shaped for the real backend.
//
// Every function returns what the server is expected to return, and throws an Error with a
// readable message when something fails, so the page needs no change when this file switches to
// the real endpoints. When that happens, send the calls through `protectedRequestPath` /
// `protectedRequestWithFileHandling` in `@/lib/api-client` (they handle the login token and
// session refresh), and turn a response with `isSuccess: false` into `throw new Error(message)`.
//
// Rules the real server must enforce itself (the page's checks can be bypassed):
//  - only an admin may call these
//  - Publish, and Save on an already published pack, need name, description, teacher, grade,
//    subject, price > 0, valid custom days and shares totalling exactly 100
//  - a draft needs only a name
//  - the cover (JPG, PNG or WebP, under 2 MB) is checked again and stored under a generated name
//
// Planned endpoints (names follow the other modules, e.g. /api/tutor/..., /api/class/...):
//   GET  /api/study-pack/get-all
//   POST /api/study-pack/create          multipart: pack fields + optional cover file
//   PUT  /api/study-pack/update/{id}     multipart: pack fields + optional cover file
// The cover travels with the pack in one request, so cancelling the form never leaves an
// orphaned upload behind. Teachers come from the tutors API (getTutors).

import { SEED_PACKS, SEED_TEACHERS } from './mockData';

const LATENCY_MS = 250;

// Kept at module level so a pack created here is still there after navigating away and back.
let store = SEED_PACKS.map((pack) => ({ ...pack }));

function respond(value) {
  return new Promise((resolve) => setTimeout(() => resolve(JSON.parse(JSON.stringify(value))), LATENCY_MS));
}

// Mock only: the real server returns a hosted URL instead of the image data.
function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read the cover image.'));
    reader.readAsDataURL(file);
  });
}

/** @returns {Promise<Array>} every study pack */
export async function getPacks() {
  return respond(store);
}

/** @returns {Promise<Array<{ id: string, name: string, subject?: string }>>} */
export async function getTeachers() {
  return respond(SEED_TEACHERS);
}

/**
 * New packs start with no recordings; sessions are added later from Class Recordings.
 * @param {object} values   name, description, teacherId, grade, subject, price, validity, customDays?, shares
 * @param {{ coverFile?: File, publish?: boolean }} options
 * @returns {Promise<object>} the full saved pack
 */
export async function createPack(values, { coverFile, publish = false } = {}) {
  const coverUrl = coverFile ? await readAsDataUrl(coverFile) : undefined;
  const pack = {
    ...values,
    id: `sp-${Date.now()}`,
    coverUrl,
    status: publish ? 'published' : 'draft',
    sessions: 0,
    totalDuration: 0,
    updatedAt: new Date().toISOString(),
  };
  store = [pack, ...store];
  return respond(pack);
}

/**
 * Sends the whole pack, not just the changed fields, and returns the whole saved pack.
 * A published pack stays published; `publish: true` publishes a draft.
 * @param {string} id
 * @param {object} values
 * @param {{ coverFile?: File, removeCover?: boolean, publish?: boolean }} options
 * @returns {Promise<object>} the full saved pack
 */
export async function updatePack(id, values, { coverFile, removeCover = false, publish = false } = {}) {
  const current = store.find((pack) => pack.id === id);
  if (!current) throw new Error('This study pack no longer exists.');

  let coverUrl = current.coverUrl;
  if (coverFile) coverUrl = await readAsDataUrl(coverFile);
  else if (removeCover) coverUrl = undefined;

  const updated = {
    ...current,
    ...values,
    coverUrl,
    status: publish ? 'published' : current.status,
    updatedAt: new Date().toISOString(),
  };
  store = store.map((pack) => (pack.id === id ? updated : pack));
  return respond(updated);
}
