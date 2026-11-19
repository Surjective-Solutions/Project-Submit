import { protectedRequestPath } from '@/lib/api-client';
import { attendance as mockAttendance, students as mockStudents } from './api';

// Data for the teacher's Attendance page: the same shapes as the admin page (see attendance/api.js), but the server
// answers only for the signed-in teacher's own classes.
//
//   GET /api/teacher-attendance/students/by-barcode/:code
//   GET /api/teacher-attendance/students/by-phone/:number
//        -> { id, name, initials, phone, grade, enrolledSince?,
//             enrolledClasses: [{ name, tutor, weekday, startTime }] }
//        :code is sent normalised (lower case, no spaces or dashes), :number in local form, "0771234567".
//        Answers 200 with an empty body (null) when no student has it, and also when the student exists but is not
//        enrolled in any class of this teacher. enrolledClasses lists this teacher's classes only. The address and
//        other private details are left out.
//   GET /api/teacher-attendance/records?studentId=&from=&to=
//        -> [{ date, className, tutor, startTime, status: "present"|"late"|"absent", scannedAt }]
//        Only this teacher's classes, one row per scheduled class between from and to (inclusive), none for classes
//        that have not started. Answers 200 with [] for a student who is not in the teacher's classes.
//
// The teacher is taken from the access token. A tutor-role token must be allowed on these routes, and nothing in the
// request may name the teacher.
//
// To look at the page before the endpoints exist, set NEXT_PUBLIC_MOCK_TEACHER_ATTENDANCE=true in .env.local and
// restart `next dev`. The sample students are then the admin demo's students enrolled with "Mr. Perera".
const USE_MOCK = process.env.NEXT_PUBLIC_MOCK_TEACHER_ATTENDANCE === 'true';
const MOCK_TEACHER = { id: 't-perera', name: 'Mr. Perera' };

// An empty body means "no such student", so it comes back as null.
async function getOrNull(path) {
  try {
    return (await protectedRequestPath(path, { method: 'GET' })) || null;
  } catch (error) {
    if (error instanceof SyntaxError) return null;
    throw error;
  }
}

// What the server does in the real thing: keep a student only if one of their classes is this teacher's, and show
// only those classes.
function mockScope(student) {
  if (!student) return null;
  const own = student.enrolledClasses.filter((c) => c.tutor === MOCK_TEACHER.name);
  if (!own.length) return null;
  const { address, ...rest } = student;
  return { ...rest, enrolledClasses: own };
}

export const students = {
  async byBarcode(code) {
    if (USE_MOCK) return mockScope(await mockStudents.byBarcode(code));
    return getOrNull(`/api/teacher-attendance/students/by-barcode/${encodeURIComponent(code)}`);
  },
  async byPhone(phone) {
    if (USE_MOCK) return mockScope(await mockStudents.byPhone(phone));
    return getOrNull(`/api/teacher-attendance/students/by-phone/${encodeURIComponent(phone)}`);
  },
};

// The teacher has one tutor: themselves, so there is nothing to choose and the page hides the tutor filter.
export const tutors = {
  async list() {
    return [];
  },
};

export const attendance = {
  async range({ studentId, from, to }) {
    if (USE_MOCK) {
      const own = mockScope(await mockStudents.byBarcode(studentId));
      return own ? mockAttendance.range({ studentId, from, to, tutorId: MOCK_TEACHER.id }) : [];
    }
    const params = new URLSearchParams({ studentId, from, to });
    const rows = await protectedRequestPath(`/api/teacher-attendance/records?${params}`, { method: 'GET' });
    if (!Array.isArray(rows)) throw new Error('Unexpected response');
    return rows;
  },
};
