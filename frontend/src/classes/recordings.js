// Class Recordings lookup used by the session form: the same lookup as the study pack's Add recordings step.
// A recording is { code, title, subject, medium, classDate: 'YYYY-MM-DD', durationMins }; null when the code is unknown.
//
// The sample classes in classes/api.js (still mock data) register the sample recordings they point at with
// registerRecording(), and those are found first. Any other code is looked up on the server.

import { getRecordingByCode as lookup } from '@/study-packs/recordingsApi';

const SAMPLES = new Map();

// Mock only: remembers a sample recording so a sample session's code can be looked up. Returns its code.
export function registerRecording(recording) {
  SAMPLES.set(recording.code, recording);
  return recording.code;
}

// GET a recording by its code (already trimmed and upper-cased by the caller).
export async function getRecordingByCode(code) {
  const sample = SAMPLES.get(String(code || ''));
  if (sample) return { ...sample };
  return lookup(code);
}
