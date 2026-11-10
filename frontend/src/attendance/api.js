// Mock API for the Attendance page. Swap each function for a fetch() to the real endpoint:
//
//   GET /students/by-barcode/:code
//        -> { id, name, initials, phone, address, grade, enrolledSince?,
//             enrolledClasses: [{ name, tutor, weekday, startTime }] }  or 404 when there is no match
//        :code is sent normalised (lower case, no spaces or dashes); compare it with the student ID
//        normalised the same way. weekday is 0–6 (Sunday = 0) or "Thu"; startTime is "HH:mm" (24 h).
//        enrolledSince ("YYYY-MM-DD", optional) is the earliest class date the page lets staff pick.
//   GET /students/by-phone/:number
//        -> the same student object, or 404 when no student has that contact number
//        :number is sent in local form, "0771234567". Contact numbers are unique per student.
//   GET /tutors
//        -> [{ id, name, subjects: [..] }]
//   GET /attendance?studentId&from&to&tutorId
//        -> [{ date, className, tutor, startTime, status, scannedAt }]
//        One row per scheduled class between from and to (inclusive), for that student, optionally
//        only the given tutor's. status is present | late | absent (Present = scanned in at or before
//        10 minutes after the start, Late = later, Absent = no scan, scannedAt null). Leave out
//        classes that have not started yet.
//
// Return null from students.byBarcode / byPhone for an unknown code and throw for any other failure.

import {
  addDays,
  minutesOf,
  normalizeBarcode,
  normalizePhone,
  statusFromScan,
  todayIso,
  weekdayIndex,
  weekdayOf,
} from './utils';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const TUTORS = [
  { id: 't-perera', name: 'Mr. Perera', subjects: ['Physics'] },
  { id: 't-fernando', name: 'Mrs. Fernando', subjects: ['Chemistry'] },
  { id: 't-silva', name: 'Mr. Silva', subjects: ['Combined Mathematics'] },
  { id: 't-jayasinghe', name: 'Ms. Jayasinghe', subjects: ['Biology'] },
];

const STUDENTS = [
  {
    id: 'SY-26-04821',
    name: 'Kavindi S. Dissanayake',
    initials: 'KD',
    phone: '0771234567',
    address: 'No. 12, Lake Road, Peradeniya',
    grade: 'Grade 13 · A/L 2026 · Biological Science',
    enrolledSince: '2026-06-01',
    enrolledClasses: [
      { name: 'Physics', tutor: 'Mr. Perera', weekday: 2, startTime: '18:00' },
      { name: 'Chemistry', tutor: 'Mrs. Fernando', weekday: 4, startTime: '16:00' },
      { name: 'Biology', tutor: 'Ms. Jayasinghe', weekday: 6, startTime: '08:30' },
    ],
  },
  {
    id: 'SY-27-01234',
    name: 'Sahan Rajapaksha',
    initials: 'SR',
    phone: '0714567890',
    address: '45/2, Temple Road, Matale',
    grade: 'Grade 12 · A/L 2027 · Physical Science',
    enrolledSince: '2026-08-17',
    enrolledClasses: [
      { name: 'Physics', tutor: 'Mr. Perera', weekday: 2, startTime: '18:00' },
      { name: 'Combined Mathematics', tutor: 'Mr. Silva', weekday: 6, startTime: '14:00' },
    ],
  },
  {
    id: 'SY-OL-00512',
    name: 'Anushka Wickramasinghe',
    initials: 'AW',
    phone: '0756815439',
    address: 'No. 7, Galle Road, Kalutara',
    grade: 'Grade 11 · O/L 2026',
    enrolledSince: '2026-06-01',
    enrolledClasses: [
      { name: 'Science', tutor: 'Mrs. Fernando', weekday: 3, startTime: '15:30' },
      { name: 'Mathematics', tutor: 'Mr. Silva', weekday: 6, startTime: '10:00' },
    ],
  },
];

// A stable pseudo-random number from a string, so the demo data does not change between loads.
function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function localIso(date, minutes) {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0');
  const m = String(Math.floor(minutes % 60)).padStart(2, '0');
  return `${date}T${h}:${m}:00`;
}

function scanFor(studentId, date, cls) {
  const h = hash(`${studentId}|${date}|${cls.name}`);
  const roll = h % 100;
  const start = minutesOf(cls.startTime);
  if (roll >= 86) return null; // absent
  if (roll >= 70) return localIso(date, start + 11 + ((h >> 5) % 30)); // late: 11–40 min after
  return localIso(date, start - 15 + ((h >> 4) % 26)); // present: 15 min before to 10 min after
}

export const students = {
  async byBarcode(code) {
    await wait(220);
    const wanted = normalizeBarcode(code);
    const found = STUDENTS.find((s) => normalizeBarcode(s.id) === wanted);
    return found ? structuredClone(found) : null;
  },

  async byPhone(phone) {
    await wait(220);
    const wanted = normalizePhone(phone);
    const found = wanted ? STUDENTS.find((s) => normalizePhone(s.phone) === wanted) : null;
    return found ? structuredClone(found) : null;
  },
};

export const tutors = {
  async list() {
    await wait(120);
    return structuredClone(TUTORS);
  },
};

export const attendance = {
  async range({ studentId, from, to, tutorId }) {
    await wait(260);
    const student = STUDENTS.find((s) => s.id === studentId);
    if (!student) return [];
    const tutorName = tutorId ? TUTORS.find((t) => t.id === tutorId)?.name : null;
    const now = new Date();
    const today = todayIso(now);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const first = from > student.enrolledSince ? from : student.enrolledSince;
    const last = to < today ? to : today;
    const rows = [];
    for (let date = first; date <= last; date = addDays(date, 1)) {
      student.enrolledClasses.forEach((cls) => {
        if (weekdayIndex(cls.weekday) !== weekdayOf(date)) return;
        if (tutorName && cls.tutor !== tutorName) return;
        if (date === today && nowMinutes < minutesOf(cls.startTime)) return; // has not started yet
        const scannedAt = scanFor(student.id, date, cls);
        rows.push({
          date,
          className: cls.name,
          tutor: cls.tutor,
          startTime: cls.startTime,
          status: statusFromScan(cls.startTime, scannedAt),
          scannedAt,
        });
      });
    }
    return rows;
  },
};
