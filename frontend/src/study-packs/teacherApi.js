// Study Packs API for the teacher account. It has the same functions as api.js, so StudyPacksPage works with either,
// but everything is limited to the signed-in teacher:
//   - getTeachers() returns only that teacher (the form never asks which teacher or subject)
//   - getPacks() returns only their packs (the ones whose teacherId is theirs, nobody else's)
//   - getRecordingByCode() finds only their own recordings
//   - savePackWithSessions() always saves the pack as theirs, with the standard revenue split
//
// The teacher is the one in the login token (userSeq), never something the page sends.
//
// Wired to the server:
//   POST /api/study-pack/create-mine          multipart: the pack form + `items` + optional cover. Always saved as a DRAFT.
//   GET  /api/study-pack/classes              the teacher's own active classes (the Class dropdown)
//   GET  /api/class-recording/by-code/{code}  finds the teacher's own recordings only
// The server takes the teacher from the token, uses the standard revenue split (70 / 25 / 5), ignores `publish`, and
// refuses recordings or classes that are not the teacher's.
//
//   GET  /api/study-pack/list                 only the teacher's own packs, with their sessions
//   PUT  /api/study-pack/update-mine/{id}     change one of their own packs (status and split stay)

import { getTokenPayload } from '@/lib/auth';
import { getTutorById } from '@/lib/api-client';
import { readMediums, readOnlyValues } from '@/lib/teacher-profile';
import { DEFAULT_SHARES } from './constants';
import * as adminApi from './api';
import { gradeAllowed, parseExamLevels } from './examLevel';
import { getRecordingByCode as lookupRecording } from './recordingsApi';

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

// The signed-in teacher; the Reports page uses it too.
export const getMe = () => loadMe();

export async function getTeachers() {
  return [await loadMe()];
}

// The classes of the signed-in teacher (the server takes the teacher from the token).
export async function getClasses() {
  const me = await loadMe();
  return adminApi.getClasses(me.id);
}

// The server answers with the signed-in teacher's own packs only.
export async function getPacks() {
  return adminApi.getPacks();
}

export function getPackItems(pack) {
  return adminApi.getPackItems(pack);
}

// Resolves to the recording, or null when there is no such recording among the teacher's own. The server decides
// that from the token, so someone else's code looks the same as one that does not exist.
export const getRecordingByCode = (code) => lookupRecording(code);

export async function savePackWithSessions(payload, options) {
  const me = await loadMe();

  const levels = parseExamLevels(me.examLevel);
  if (!gradeAllowed(payload.values.grade, levels)) {
    throw new Error(`Pick a grade for your own level (${levels.join(' / ')}).`);
  }

  // Teachers only save, as a draft; publishing is done by an admin. The server checks the recordings and the class
  // again, and a pack that is not theirs answers "no longer exists".
  return adminApi.savePackWithSessions(
    {
      ...payload,
      values: { ...payload.values, teacherId: me.id, subject: me.subject || payload.values.subject, shares: { ...DEFAULT_SHARES } },
    },
    { ...options, publish: false, mine: true }
  );
}
