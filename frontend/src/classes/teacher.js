'use client';

import { useEffect, useState } from 'react';
import { getTokenPayload } from '@/lib/auth';

// Which tutor the signed-in teacher is, for the teacher's Classes section: the token's userSeq, the same id
// TeacherSidebar reads. The tutor ids of the classes API (/api/admin-class/tutors/:id/classes) are these ids.
// Returns undefined until the token has been read in the browser, then the id as a string, or null when
// nobody is signed in. Pages wait for it before they call the API.
//
// The server must answer only for the signed-in teacher: the classes list for any other tutor id, and
// GET /classes/:id for a class that belongs to someone else, should be refused (or come back empty).
export function useTeacherId() {
  const [id, setId] = useState(undefined);
  useEffect(() => {
    let value = null;
    try {
      value = getTokenPayload()?.userSeq ?? null;
    } catch {
      value = null;
    }
    setId(value === null ? null : String(value));
  }, []);
  return id;
}
