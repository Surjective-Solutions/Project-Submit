// Class Recordings API for the teacher account. It has the same functions as api.js, so the same page and provider work
// with either, but everything is limited to the signed-in teacher:
//   - getLibrary() returns only their own recordings (the tutor id the page passes is ignored)
//   - folders are not available yet: createFolder() and updateFolder() are refused
//   - saving a recording always saves it under the signed-in teacher (the server takes the teacher from the token)
//
// The teacher is the one in the login token (userSeq), never something the page sends. The server answers only for
// that teacher, see api.js for the endpoints.

import { getTokenPayload } from '@/lib/auth';
import * as adminApi from './api';

function myUserSeq() {
  const userSeq = getTokenPayload()?.userSeq;
  if (!userSeq) throw new Error('Please sign in again to see your class recordings.');
  return userSeq;
}

export async function getLibrary() {
  return adminApi.getLibrary(myUserSeq());
}

export async function createFolder() {
  throw new Error('Only an admin can create folders.');
}

export async function updateFolder() {
  throw new Error('Only an admin can change folders.');
}

export async function updateRecording(id, changes) {
  return adminApi.updateRecording(id, changes);
}

export async function saveRecording(payload) {
  return adminApi.saveRecording({ ...payload, tutorId: undefined });
}

// The library provider and the dialog call this name; it saves the record (nothing is uploaded).
export const uploadRecording = saveRecording;
