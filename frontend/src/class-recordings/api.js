// Class Recordings API for the admin console. Stubbed with an in-memory store until the backend exists.
//
// Every function returns a Promise and throws an Error whose message is safe to show on screen, so the pages don't
// change when real calls replace these. Nothing here is saved anywhere: a page refresh puts the sample data back.
//
// Planned endpoints (admin-only):
//   GET   /tutors                                    -> [{ id, name, photoUrl, subject, level, mediums }]
//   GET   /tutors/:id/folders                        -> every folder of the tutor [{ id, name, parentId }]
//                                                       (GET ...?parent=:folderId for one level)
//   GET   /tutors/:id/recordings                     -> [{ id, title, folderId, durationSec, sizeBytes, uploadedAt, code, shareUrl }]
//                                                       (GET ...?folder=:folderId for one folder)
//   POST  /folders        { tutorId, parentId, name }
//   PATCH /folders/:id    { name?, parentId? }
//   PATCH /recordings/:id { title?, folderId? }
//   POST  /recordings     multipart or a signed-URL upload with progress { tutorId, folderId, title, file } -> { id, code, shareUrl }
//   GET   /search?tutorId&folderId&q -> { folders, recordings }
// getLibrary() below is those list calls together; the page filters and searches what it gets.
//
// The server must repeat every rule the page checks, because the page can be bypassed:
//   - the caller is an admin
//   - folder names: required, no / or \, no duplicate in the same parent (ignoring case)
//   - a folder can't be moved into itself or one of its own sub-folders; the new parent must belong to the same tutor
//   - a recording's folder must belong to the same tutor
//   - uploads: a video file only (MP4, MOV, MKV or WebM), at most 10 GB, a non-empty title
//   - the recording code (REC-XXXX-XXXX, characters A-Z and 2-9 without I, L, O, 0, 1) is made on the server and is unique

import { buildSeed } from './mockData';
import { buildIndex, makeCode, normaliseCode, shareUrlFor, subtreeIds, videoFileError } from './utils';
import { folderNameError, recordingTitleError } from './validators';

const LATENCY_MS = 150;
const wait = (ms = LATENCY_MS) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = (value) => JSON.parse(JSON.stringify(value));

const db = buildSeed();
let counter = 1000;
const nextId = (prefix) => `${prefix}-${(counter += 1)}`;

function requireTutor(tutorId) {
  const tutor = db.tutors.find((t) => t.id === String(tutorId));
  if (!tutor) throw new Error('This tutor no longer exists.');
  return tutor;
}

function requireFolder(tutorId, folderId) {
  if (folderId === null || folderId === undefined) return null;
  const folder = db.folders.find((f) => f.id === folderId && f.tutorId === String(tutorId));
  if (!folder) throw new Error('That folder no longer exists.');
  return folder;
}

const siblingsOf = (tutorId, parentId) =>
  db.folders.filter((f) => f.tutorId === String(tutorId) && (f.parentId ?? null) === (parentId ?? null));

// Mock only: finds the library of a signed-in teacher (used by teacherApi.js). The sample tutors are made-up people,
// so a teacher is matched by id first, then by subject; a teacher with neither gets a library of their own with one
// folder, as the admin would have made it. The real backend looks the tutor up from the login token instead.
export function resolveTutor({ id, name, subject, level, mediums }) {
  let tutor = db.tutors.find((t) => t.id === String(id)) ?? (subject ? db.tutors.find((t) => t.subject === subject) : null);
  if (!tutor) {
    tutor = { id: String(id), name: name || 'You', photoUrl: null, subject: subject || '', level: level || 'A/L', mediums: mediums?.length ? mediums : ['English'] };
    db.tutors.push(tutor);
    db.folders.push({ id: `f-${tutor.id}-term`, tutorId: tutor.id, name: 'Term 2 · 2026', parentId: null });
  }
  return clone(tutor);
}

export async function listTutors() {
  await wait();
  return clone(db.tutors);
}

// Everything of one tutor: all folders and all recordings.
export async function getLibrary(tutorId) {
  await wait();
  const tutor = requireTutor(tutorId);
  return {
    tutor: clone(tutor),
    folders: clone(db.folders.filter((f) => f.tutorId === tutor.id)),
    recordings: clone(db.recordings.filter((r) => r.tutorId === tutor.id)),
  };
}

export async function createFolder({ tutorId, parentId = null, name }) {
  await wait();
  requireTutor(tutorId);
  requireFolder(tutorId, parentId);
  const error = folderNameError(name, siblingsOf(tutorId, parentId));
  if (error) throw new Error(error);
  const folder = { id: nextId('f'), tutorId: String(tutorId), name: name.trim(), parentId };
  db.folders.push(folder);
  return clone(folder);
}

// `changes` is { name?, parentId? }.
export async function updateFolder(id, changes) {
  await wait();
  const folder = db.folders.find((f) => f.id === id);
  if (!folder) throw new Error('That folder no longer exists.');

  const nextName = changes.name !== undefined ? changes.name : folder.name;
  const nextParent = changes.parentId !== undefined ? changes.parentId : folder.parentId;
  requireFolder(folder.tutorId, nextParent);

  if (nextParent !== null) {
    const index = buildIndex(db.folders.filter((f) => f.tutorId === folder.tutorId), []);
    if (subtreeIds(folder.id, index).has(nextParent)) throw new Error('A folder can’t be moved into itself.');
  }
  const error = folderNameError(nextName, siblingsOf(folder.tutorId, nextParent), folder.id);
  if (error) throw new Error(error);

  folder.name = String(nextName).trim();
  folder.parentId = nextParent;
  return clone(folder);
}

// `changes` is { title?, folderId? }.
export async function updateRecording(id, changes) {
  await wait();
  const rec = db.recordings.find((r) => r.id === id);
  if (!rec) throw new Error('That recording no longer exists.');
  if (changes.folderId !== undefined) requireFolder(rec.tutorId, changes.folderId);
  if (changes.title !== undefined) {
    const error = recordingTitleError(changes.title);
    if (error) throw new Error(error);
    rec.title = changes.title.trim();
  }
  if (changes.folderId !== undefined) rec.folderId = changes.folderId;
  return clone(rec);
}

function uniqueCode() {
  const taken = new Set(db.recordings.map((r) => normaliseCode(r.code)));
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const code = makeCode();
    if (!taken.has(normaliseCode(code))) return code;
  }
  throw new Error('Could not make a recording code. Please try again.');
}

// Mock upload: counts up like a real transfer. `onProgress({ loaded, total })` is called as it goes and `signal`
// (an AbortSignal) cancels it. `durationSec` is what the browser read from the video.
export function uploadRecording({ tutorId, folderId = null, title, file, durationSec = 0 }, { onProgress, signal } = {}) {
  return new Promise((resolve, reject) => {
    try {
      requireTutor(tutorId);
      requireFolder(tutorId, folderId);
      const titleError = recordingTitleError(title);
      if (titleError) throw new Error(titleError);
      const fileError = videoFileError(file);
      if (fileError) throw new Error(fileError);
    } catch (err) {
      reject(err);
      return;
    }

    const total = file.size || 1;
    const steps = 20;
    let step = 0;
    onProgress?.({ loaded: 0, total });

    const timer = setInterval(() => {
      step += 1;
      onProgress?.({ loaded: Math.min(total, Math.round((total * step) / steps)), total });
      if (step >= steps) {
        clearInterval(timer);
        const code = uniqueCode();
        const recording = {
          id: nextId('r'),
          tutorId: String(tutorId),
          folderId,
          title: title.trim(),
          durationSec,
          sizeBytes: file.size,
          uploadedAt: new Date().toISOString(),
          code,
          shareUrl: shareUrlFor(code),
        };
        db.recordings.push(recording);
        resolve(clone(recording));
      }
    }, 130);

    signal?.addEventListener('abort', () => {
      clearInterval(timer);
      reject(Object.assign(new Error('Upload cancelled.'), { name: 'AbortError' }));
    });
  });
}
