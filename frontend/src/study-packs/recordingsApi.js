// Class Recordings lookup by code, used by the study pack's "Add recordings" step and the session form.
//
//   GET /api/class-recording/by-code/{code}   (admin or teacher token)
//     -> 200 with the recording, or 200 with an empty body when there is none.
//   An admin finds any recording; a teacher only their own, so someone else's code looks the same as one that does
//   not exist.
//
// Returns the recording as { code, title, subject, medium, classDate: 'YYYY-MM-DD' | null, durationMins, teacherId },
// or null when the code is unknown. Throws an Error for real failures (the page then shows "could not check").

import { protectedRequestPath } from '@/lib/api-client';

// code must already be normalised (trimmed, no spaces, upper case)
export async function getRecordingByCode(code) {
  let row;
  try {
    row = await protectedRequestPath(`/api/class-recording/by-code/${encodeURIComponent(code)}`, { method: 'GET' });
  } catch (error) {
    if (error instanceof SyntaxError) return null; // an empty body: no such recording
    throw error;
  }
  if (!row?.code) return null;
  return {
    code: row.code,
    title: row.title,
    subject: row.subject || '',
    medium: row.medium || '',
    classDate: row.classDate ?? null,
    durationMins: row.durationMins ?? 0,
    teacherId: String(row.tutorId),
  };
}
