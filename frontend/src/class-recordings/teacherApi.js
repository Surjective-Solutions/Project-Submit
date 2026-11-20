// Class Recordings API for the teacher account. It has the same functions as api.js, so the same page and provider work
// with either, but everything is limited to the signed-in teacher's own library:
//   - getLibrary() returns only their folders and recordings (the tutor id the page passes is ignored)
//   - folders are made and managed by an admin: createFolder() and updateFolder() are refused
//   - a teacher can upload into any folder an admin made (or the top level) and rename or move their own recordings
//   - uploadRecording() always saves the recording under the signed-in teacher
//
// The teacher is the one in the login token (userSeq), never something the page sends.
//
// Planned endpoints (tutor role, scoped by the token on the server):
//   GET   /api/class-recording/mine                -> { tutor, folders, recordings } (the teacher's own folders and recordings)
//   PATCH /api/class-recording/mine/recordings/:id { title?, folderId? }
//   POST  /api/class-recording/mine/recordings     multipart or a signed-URL upload with progress { folderId, title, file }
//                                                  -> { id, code, shareUrl }
// The server must repeat every rule of api.js, and also:
//   - the tutor comes from the token, ignoring any tutorId in the request
//   - there is no teacher endpoint for creating, renaming or moving folders (answer 403 if one is called)
//   - a teacher can only read, upload to or change recordings and folders of their own library (answer 404 otherwise)
//
// For now the data is the mock store in api.js (mock only: the sample tutors are made-up people, so a teacher is matched by
// id, then by subject, see resolveTutor).

import { getTokenPayload } from '@/lib/auth';
import { getTutorById } from '@/lib/api-client';
import { readMediums, readOnlyValues } from '@/lib/teacher-profile';
import * as adminApi from './api';

// The teacher profile calls this "Combined Mathematics"; the sample tutors call it "Combined Maths".
const SUBJECT_NAMES = { 'combined mathematics': 'Combined Maths' };
const subjectName = (raw) => {
  const text = String(raw ?? '').trim();
  return SUBJECT_NAMES[text.toLowerCase()] ?? text;
};

// Looked up again whenever the signed-in user changes, so one teacher's library is never shown to another.
let cache = null; // { userSeq, promise }

// The signed-in teacher's own tutor record.
function loadTutor() {
  const userSeq = getTokenPayload()?.userSeq;
  if (!userSeq) return Promise.reject(new Error('Please sign in again to see your class recordings.'));
  if (cache?.userSeq !== String(userSeq)) {
    const promise = (async () => {
      const profile = await getTutorById(userSeq);
      return adminApi.resolveTutor({
        id: String(userSeq),
        name: profile?.displayName,
        subject: subjectName(profile?.subject_area ?? profile?.subject),
        level: readOnlyValues(profile).exam_level,
        mediums: readMediums(profile),
      });
    })();
    cache = { userSeq: String(userSeq), promise };
    promise.catch(() => {
      if (cache?.promise === promise) cache = null; // try again next time
    });
  }
  return cache.promise;
}

export async function getLibrary() {
  const tutor = await loadTutor();
  return adminApi.getLibrary(tutor.id);
}

export async function createFolder() {
  throw new Error('Only an admin can create folders.');
}

export async function updateFolder() {
  throw new Error('Only an admin can change folders.');
}

export async function updateRecording(id, changes) {
  const library = await getLibrary();
  if (!library.recordings.some((r) => r.id === id)) throw new Error('That recording no longer exists.');
  return adminApi.updateRecording(id, changes);
}

// The folder (if any) must be one of this teacher's own; api.js checks that against the tutor id given here.
export async function uploadRecording(payload, options) {
  const tutor = await loadTutor();
  return adminApi.uploadRecording({ ...payload, tutorId: tutor.id }, options);
}
