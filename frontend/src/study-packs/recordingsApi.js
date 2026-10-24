// Class Recordings lookup — stubbed for now.
//
// Planned endpoint: GET /api/class-recording/by-code/{code}  (admin-only)
//   -> 200 with the recording, or 404 when the code does not exist.
// Swap the body of getRecordingByCode for a protectedRequestPath call when it exists.
// Keep returning `null` for "not found" and throwing an Error for real failures.

import { findRecording } from './mockRecordings';

const LATENCY_MS = 200;

// code must already be normalised (trimmed, no spaces, upper case)
export function getRecordingByCode(code) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const found = findRecording(code);
      resolve(found ? { ...found } : null);
    }, LATENCY_MS);
  });
}
