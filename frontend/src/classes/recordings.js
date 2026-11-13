// Class Recordings lookup used by the session form.
//
// This is a stand-in. Study Packs already looks recordings up by code; point this at the same source by
// replacing the body of getRecordingByCode with:
//
//   import { getRecordingByCode as lookup } from '@/study-packs/recordingsApi';
//   export const getRecordingByCode = (code) => lookup(code);
//
// A recording is { code, title, subject, medium, classDate: 'YYYY-MM-DD', durationMins }, and the lookup
// returns null when the code is unknown. Codes look like REC-PHY-0614-K7.

const wait = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

const BY_CODE = new Map();

export function registerRecording(recording) {
  BY_CODE.set(recording.code, recording);
  return recording.code;
}

[
  { code: 'REC-PHY-0614-K7', title: 'Projectile motion — horizontal launch', subject: 'Physics', medium: 'Sinhala', classDate: '2026-06-14', durationMins: 96 },
  { code: 'REC-PHY-1103-A4', title: 'Circular motion — banked tracks', subject: 'Physics', medium: 'English', classDate: '2026-11-03', durationMins: 104 },
  { code: 'REC-CHE-1027-Q2', title: 'Organic chemistry — alcohols', subject: 'Chemistry', medium: 'Sinhala', classDate: '2026-10-27', durationMins: 88 },
].forEach(registerRecording);

// GET a recording by its code (already trimmed and upper-cased by the caller).
export async function getRecordingByCode(code) {
  await wait();
  const found = BY_CODE.get(String(code || ''));
  return found ? { ...found } : null;
}
