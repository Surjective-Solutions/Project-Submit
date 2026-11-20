// Study Packs API for the teacher account. It has the same functions as api.js, so StudyPacksPage works with either,
// but everything is limited to the signed-in teacher:
//   - getTeachers() returns only that teacher (the form never asks which teacher or subject)
//   - getPacks() returns only their packs (the ones whose teacherId is theirs, nobody else's)
//   - getRecordingByCode() finds only their own recordings
//   - savePackWithSessions() always saves the pack as theirs, with the standard revenue split
//
// The teacher is the one in the login token (userSeq), never something the page sends.
//
// Planned endpoints (tutor role, scoped by the token on the server):
//   GET    /api/study-pack/mine
//   POST   /api/study-pack/create-mine        multipart: pack JSON (with items) + optional cover file
//   PUT    /api/study-pack/update-mine/{id}   multipart: pack JSON (with items) + optional cover file
//   GET    /api/class-recording/mine/by-code/{code}   -> 200 with the recording, or 404 when it isn't theirs
// The server must repeat every rule of api.js, and also:
//   - teacherId and subject come from the token's teacher, ignoring anything in the request
//   - the revenue shares are the institute's standard split (70 / 25 / 5), not what the request says
//   - every recordingCode must belong to this teacher (answer 404 for someone else's, as if it didn't exist)
//   - a teacher can only save: status stays draft (or whatever it already is); publishing, the price split and going live
//     are admin-only, so ignore any `publish` in the request
//   - the grade must be one of the teacher's own exam level (A/L teachers: A/L grades only; O/L teachers: O/L only)
//   - a pack can only be read or changed by the teacher it belongs to
//
// For now the data is the mock store in api.js. Mock only: the sample recordings belong to made-up teachers, so the ones
// with the signed-in teacher's subject count as theirs (see MOCK_OWN_RECORDINGS_BY_SUBJECT). Packs are strict: a teacher
// only ever sees packs saved under their own id.

import { getTokenPayload } from '@/lib/auth';
import { getTutorById } from '@/lib/api-client';
import { readMediums, readOnlyValues } from '@/lib/teacher-profile';
import { DEFAULT_SHARES } from './constants';
import * as adminApi from './api';
import { gradeAllowed, parseExamLevels } from './examLevel';
import { findRecording } from './mockRecordings';

const MOCK_OWN_RECORDINGS_BY_SUBJECT = true;

// The teacher profile calls this "Combined Mathematics"; the study pack subject list calls it "Combined Maths".
const SUBJECT_NAMES = { 'combined mathematics': 'Combined Maths' };
const subjectName = (raw) => {
  const text = String(raw ?? '').trim();
  return SUBJECT_NAMES[text.toLowerCase()] ?? text;
};

// The teacher is looked up again whenever the signed-in user changes, so one teacher's details are never used for another.
let cache = null; // { userSeq, promise }

// { id, name, subject, examLevel, mediums } of the signed-in teacher.
function loadMe() {
  const userSeq = getTokenPayload()?.userSeq;
  if (!userSeq) return Promise.reject(new Error('Please sign in again to see your study packs.'));
  if (cache?.userSeq !== String(userSeq)) {
    const promise = (async () => {
      const tutor = await getTutorById(userSeq);
      return {
        id: String(userSeq),
        name: tutor?.displayName || 'You',
        subject: subjectName(tutor?.subject_area ?? tutor?.subject),
        // same column names the My account page reads, e.g. "A/L" or "O/L"
        examLevel: readOnlyValues(tutor).exam_level,
        mediums: readMediums(tutor),
      };
    })();
    cache = { userSeq: String(userSeq), promise };
    promise.catch(() => {
      if (cache?.promise === promise) cache = null; // try again next time
    });
  }
  return cache.promise;
}

// A pack is the teacher's only when it was saved under their id.
const isMyPack = (me, pack) => String(pack.teacherId) === me.id;

const isMyRecording = (me, recording) =>
  String(recording.teacherId) === me.id ||
  (MOCK_OWN_RECORDINGS_BY_SUBJECT && Boolean(me.subject) && recording.subject === me.subject);

// The signed-in teacher; the Reports page uses it too.
export const getMe = () => loadMe();

export async function getTeachers() {
  return [await loadMe()];
}

export async function getPacks() {
  const me = await loadMe();
  return (await adminApi.getPacks()).filter((pack) => isMyPack(me, pack));
}

export function getPackItems(pack) {
  return adminApi.getPackItems(pack);
}

// Resolves to the recording, or null when there is no such recording among the teacher's own.
export async function getRecordingByCode(code) {
  const me = await loadMe();
  await new Promise((resolve) => setTimeout(resolve, 200));
  const recording = findRecording(code);
  if (!recording || !isMyRecording(me, recording)) return null;
  return { ...recording, teacherId: me.id };
}

export async function savePackWithSessions(payload, options) {
  const me = await loadMe();

  if (payload.id) {
    const existing = (await adminApi.getPacks()).find((pack) => String(pack.id) === String(payload.id));
    if (!existing || !isMyPack(me, existing)) throw new Error('This study pack no longer exists.');
  }
  for (const item of payload.items) {
    if (!(await getRecordingByCode(item.recordingCode))) {
      throw new Error(`Recording ${item.recordingCode} isn’t one of your recordings. Remove it and try again.`);
    }
  }

  const levels = parseExamLevels(me.examLevel);
  if (!gradeAllowed(payload.values.grade, levels)) {
    throw new Error(`Pick a grade for your own level (${levels.join(' / ')}).`);
  }

  // Teachers only save; publishing is done by an admin.
  return adminApi.savePackWithSessions(
    {
      ...payload,
      values: { ...payload.values, teacherId: me.id, subject: me.subject || payload.values.subject, shares: { ...DEFAULT_SHARES } },
    },
    { ...options, publish: false }
  );
}
