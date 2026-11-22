// Class Recordings API for the admin console. A "recording" here is only a record: its title, teacher, class date,
// length and (optionally) a link to where the video is hosted. The video file is never uploaded. Saving a record makes
// a recording code on the server (REC-1001, REC-1002, ...) that study packs and sessions use to point at it.
//
// Every function returns a Promise and throws an Error whose message is safe to show on screen.
//
// Endpoints (admin or tutor token):
//   POST /api/class-recording/create  { title, tutorId?, classDate?, durationMins?, videoUrl? }
//        -> { isSuccess, message, recording: { id, code, title, tutorId, tutorName, classDate, durationMins, videoUrl, createdAt } }
//        An admin names the teacher (tutorId); for a teacher the server uses the one in the token.
//   GET  /api/class-recording/list?tutorId=   -> [recording]   (a teacher always gets their own)
//
// Folders are not on the server yet, so every recording sits at the top level and folders can't be made or changed.
// The server repeats every rule the form checks, because the page can be bypassed.

import { API_BASE, getTutorById, getTutors, protectedRequestPath } from '@/lib/api-client';
import { shareUrlFor } from './utils';
import { recordingTitleError } from './validators';

const NO_FOLDERS = 'Folders are not available yet. Recordings are kept at the top level.';

// The shape the pages use, built from what the server sends.
export function toRecording(row) {
  return {
    id: String(row.id),
    tutorId: String(row.tutorId),
    folderId: null,
    title: row.title,
    durationSec: (row.durationMins ?? 0) * 60,
    sizeBytes: null,
    classDate: row.classDate ?? null,
    uploadedAt: row.createdAt,
    code: row.code,
    videoUrl: row.videoUrl ?? null,
    shareUrl: row.videoUrl || shareUrlFor(row.code),
  };
}

// The server sends a photo as a path on itself, so it needs the server's address.
const photoOf = (path) => (path ? (path.startsWith('/') ? `${API_BASE}${path}` : path) : null);

// A tutor as the pages use them, from the server's profile.
export function toTutor(profile) {
  return {
    id: String(profile.id),
    name: profile.displayName || profile.teacher_name || profile.username || 'Teacher',
    photoUrl: photoOf(profile.profile_image_url),
    subject: profile.subject_area || profile.subject || '',
    level: profile.examLevel || '',
    mediums: String(profile.medium ?? '')
      .split(/[,/]/)
      .map((m) => m.trim())
      .filter(Boolean),
  };
}

async function request(path, options) {
  try {
    return await protectedRequestPath(path, options);
  } catch (error) {
    throw new Error(error?.message?.startsWith('HTTP Error 403')
      ? 'You are not allowed to do this.'
      : 'Could not reach the server. Please try again.');
  }
}

export async function listTutors() {
  const rows = await getTutors();
  return (Array.isArray(rows) ? rows : []).map(toTutor);
}

// Everything of one tutor: their recordings (there are no folders yet).
export async function getLibrary(tutorId) {
  const profile = await getTutorById(tutorId);
  if (!profile) throw new Error('This tutor no longer exists.');
  const rows = await request(`/api/class-recording/list?tutorId=${encodeURIComponent(tutorId)}`, { method: 'GET' });
  return {
    tutor: toTutor(profile),
    folders: [],
    recordings: (Array.isArray(rows) ? rows : []).map(toRecording),
  };
}

export async function createFolder() {
  throw new Error(NO_FOLDERS);
}

export async function updateFolder() {
  throw new Error(NO_FOLDERS);
}

export async function updateRecording() {
  throw new Error('Recordings can’t be edited yet.');
}

// Saves the record. `tutorId` is ignored by the server for a teacher. `durationSec` is converted to whole minutes.
// Resolves with the saved recording, including its new code.
export async function saveRecording({ tutorId, title, classDate, durationSec = 0, videoUrl }) {
  const titleError = recordingTitleError(title);
  if (titleError) throw new Error(titleError);

  const body = {
    title: title.trim(),
    tutorId: tutorId === undefined || tutorId === null ? undefined : Number(tutorId),
    classDate: classDate || undefined,
    durationMins: durationSec ? Math.round(durationSec / 60) : undefined,
    videoUrl: videoUrl?.trim() || undefined,
  };
  const result = await request('/api/class-recording/create', { method: 'POST', body });
  if (!result?.isSuccess || !result.recording) {
    throw new Error(result?.message || 'The recording could not be saved.');
  }
  return toRecording(result.recording);
}

// The library provider and the dialog call this name; it saves the record (nothing is uploaded).
export const uploadRecording = saveRecording;
