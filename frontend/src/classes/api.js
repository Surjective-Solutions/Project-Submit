// Data layer for the Classes section. It serves mock data for now; swap each function's body for a
// fetch to the endpoint named above it. The shapes below are what the pages expect.
//
//   GET  /tutors              -> [{ id, name, photoUrl, description, subject, level: "A/L"|"O/L", mediums: [],
//                                   phone, classCount, studentCount }]    (classCount excludes packages)
//                                  photoUrl and description come from the tutor's own account (either may be
//                                  null).
//   GET  /tutors/:id/classes  -> [{ id, title, batchYear, level, type: "Theory"|"Paper"|"Revision", medium, day,
//                                   startTime, endTime, mode: "hall"|"online", hall, enrolledCount, monthlyFee }]
//                                  and, in the same list, the tutor's packages:
//                                  { id, title, batchYear, level, type: "Package", medium, classIds: [classId, ...],
//                                    monthlyFee }  where monthlyFee is the package price. The page adds up the
//                                  included classes' fees itself to show the usual price and the saving, so the
//                                  package price must be lower than that sum.
//   POST /classes             -> { tutorId, ...fields to be defined }
//
//   GET  /classes/:id         -> { ...the class above, tutorId, tutor: { id, name, subject, photoUrl, mediums },
//                                  enrollments: { total, paidThisMonth, free } }      (null/404 when not found)
//   GET  /classes/:id/sessions           -> [Session]
//   POST /classes/:id/sessions           -> { session }      body: the Session fields below, without id
//   PUT  /classes/:id/sessions/:sessionId -> { session }
//   DELETE /classes/:id/sessions/:sessionId -> { ok: true }
//   GET  /halls               -> [{ id, name }]
//
//   Session = { id, name, access: "all"|"registered"|"paid", mode: "online"|"physical",
//               startsAt: "YYYY-MM-DDTHH:mm", expiresAt: "YYYY-MM-DDTHH:mm"|null, hall: string|null,
//               recordingCode: "REC-PHY-0614-K7"|null, shares: { teacher, institute, system } }  (shares in %, total 100)
//   Business errors should come back as 200 + { isSuccess: false, message } like the rest of the app, because
//   a 401/403 is read as an expired login.

import { registerRecording } from './recordings';

const DELAY_MS = 350;
const wait = (ms = DELAY_MS) => new Promise((resolve) => setTimeout(resolve, ms));

// A tiny photo so the "has a photo" path can be seen; the other tutors show initials.
const PHOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='#c9d0ea'/><circle cx='50' cy='38' r='18' fill='#223385'/><path d='M14 100c4-26 20-36 36-36s32 10 36 36z' fill='#223385'/></svg>",
  );

const DAYS = ['Saturday', 'Sunday', 'Wednesday', 'Friday', 'Thursday', 'Monday', 'Tuesday'];
const SLOTS = [
  ['08:30', '10:30'],
  ['10:30', '12:30'],
  ['14:00', '16:00'],
  ['16:00', '18:00'],
  ['18:00', '20:00'],
];

// Which batches a tutor teaches and which class types each has: [year, [types]].
const PLAN = {
  't-perera': { level: 'A/L', batches: [[2026, ['Theory', 'Paper', 'Revision']], [2027, ['Theory', 'Paper']], [2028, ['Theory']]] },
  't-fernando': { level: 'A/L', batches: [[2026, ['Theory', 'Revision']], [2027, ['Theory', 'Paper']], [2028, ['Theory']]] },
  't-jayasinghe': { level: 'A/L', batches: [[2026, ['Theory', 'Paper']], [2027, ['Theory']]] },
  't-silva': { level: 'A/L', batches: [[2026, ['Theory', 'Paper', 'Revision']], [2027, ['Theory', 'Revision']]] },
  't-wickrama': { level: 'A/L', batches: [[2027, ['Theory', 'Paper']], [2028, ['Theory']]] },
  't-rajapaksha': { level: 'O/L', batches: [[2026, ['Theory', 'Paper', 'Revision']], [2027, ['Theory', 'Paper']]] },
  't-kumari': { level: 'O/L', batches: [[2026, ['Theory', 'Revision']], [2027, ['Theory']]] },
  't-selvaraj': { level: 'O/L', batches: [[2027, ['Theory', 'Paper']]] },
};

const TUTOR_BASE = [
  { id: 't-perera', name: 'Mr. Nuwan Perera', photoUrl: PHOTO, description: 'Physics teacher with over a decade of A/L experience. Known for making mechanics and electricity easy to follow with plenty of worked examples.', subject: 'Physics', mediums: ['Sinhala', 'English'], phone: '0771234567', hall: 'Hall A · Maharagama' },
  { id: 't-fernando', name: 'Mrs. Dilani Fernando', photoUrl: null, description: 'Specialises in organic chemistry and past-paper practice. Small, focused classes with weekly short tests.', subject: 'Chemistry', mediums: ['Sinhala'], phone: '0712345678', hall: 'Hall B · Maharagama' },
  { id: 't-jayasinghe', name: 'Ms. Tharushi Jayasinghe', photoUrl: null, description: null, subject: 'Biology', mediums: ['English'], phone: '0759876543', hall: 'Hall A · Maharagama' },
  { id: 't-silva', name: 'Mr. Kasun Silva', photoUrl: null, description: 'Combined Mathematics, step by step, from the basics to the hardest paper questions.', subject: 'Combined Mathematics', mediums: ['Sinhala', 'English'], phone: '0764561230', hall: 'Hall C · Nugegoda' },
  { id: 't-wickrama', name: 'Mr. Ruwan Wickramasinghe', photoUrl: null, description: null, subject: 'ICT', mediums: ['Sinhala', 'English'], phone: '0701112223', hall: 'Hall B · Maharagama' },
  { id: 't-rajapaksha', name: 'Mr. Sampath Rajapaksha', photoUrl: null, description: null, subject: 'Mathematics', mediums: ['Sinhala'], phone: '0777654321', hall: 'Hall A · Maharagama' },
  { id: 't-kumari', name: 'Mrs. Anusha Kumari', photoUrl: null, description: 'Science teacher for the O/L syllabus who teaches in Sinhala and Tamil.', subject: 'Science', mediums: ['Sinhala', 'Tamil'], phone: '0723334445', hall: 'Hall C · Nugegoda' },
  { id: 't-selvaraj', name: 'Ms. Priya Selvaraj', photoUrl: null, description: null, subject: 'English', mediums: ['English', 'Tamil'], phone: '0745556667', hall: 'Hall B · Maharagama' },
];

function buildClasses(tutor) {
  const plan = PLAN[tutor.id];
  const out = [];
  let n = 0;
  plan.batches.forEach(([year, types], batchIndex) => {
    types.forEach((type) => {
      const [startTime, endTime] = SLOTS[(n + batchIndex) % SLOTS.length];
      const longer = type === 'Paper' ? 3 : 2;
      const endHour = String(Number(startTime.slice(0, 2)) + longer).padStart(2, '0');
      // A batch is taught in one medium; for tutors with two, the first batch's Paper is in the other one.
      const mediumIndex = (type === 'Paper' && batchIndex === 0 ? batchIndex + 1 : batchIndex) % tutor.mediums.length;
      out.push({
        id: `c-${tutor.id}-${n + 1}`,
        tutorId: tutor.id,
        title: `${year} ${plan.level} ${tutor.subject}`,
        batchYear: year,
        level: plan.level,
        type,
        medium: tutor.mediums[mediumIndex],
        day: DAYS[(n * 2 + batchIndex) % DAYS.length],
        startTime,
        endTime: type === 'Paper' ? `${endHour}:${endTime.slice(3)}` : endTime,
        mode: (n + batchIndex) % 4 === 3 ? 'online' : 'hall',
        hall: tutor.hall,
        enrolledCount: 18 + ((n * 17 + batchIndex * 11 + tutor.name.length) % 47),
        monthlyFee: type === 'Theory' ? 3500 : type === 'Paper' ? 3000 : 2500,
      });
      n += 1;
    });
  });
  return out;
}

// Packages: for each batch and medium where the tutor runs two or more classes, one package of those classes
// at 15% off the total, rounded to the nearest 100.
function buildPackages(tutor, classes) {
  const groups = new Map();
  for (const cls of classes) {
    const key = `${cls.batchYear}|${cls.medium}`;
    groups.set(key, [...(groups.get(key) || []), cls]);
  }
  const out = [];
  for (const members of groups.values()) {
    if (members.length < 2) continue;
    const regular = members.reduce((sum, c) => sum + c.monthlyFee, 0);
    const first = members[0];
    out.push({
      id: `p-${tutor.id}-${first.batchYear}-${first.medium.toLowerCase()}`,
      title: `${first.batchYear} ${first.level} ${tutor.subject} Package`,
      batchYear: first.batchYear,
      level: first.level,
      type: 'Package',
      medium: first.medium,
      classIds: members.map((c) => c.id),
      monthlyFee: Math.round((regular * 0.85) / 100) * 100,
    });
  }
  return out;
}

const CLASSES = Object.fromEntries(TUTOR_BASE.map((t) => [t.id, buildClasses(t)]));
const PACKAGES = Object.fromEntries(TUTOR_BASE.map((t) => [t.id, buildPackages(t, CLASSES[t.id])]));

// The tutor's hall and years of teaching are not part of what the pages need, so they are not returned.
const TUTORS = TUTOR_BASE.map(({ hall, ...t }) => ({
  ...t,
  level: PLAN[t.id].level,
  classCount: CLASSES[t.id].length,
  studentCount: CLASSES[t.id].reduce((sum, c) => sum + c.enrolledCount, 0),
}));

export const tutors = {
  // GET /tutors
  async list() {
    await wait();
    return TUTORS.map((t) => ({ ...t, mediums: [...t.mediums] }));
  },
  // GET /tutors/:id/classes
  async classes(id) {
    await wait();
    return [...(CLASSES[id] || []), ...(PACKAGES[id] || [])].map((c) => ({ ...c, ...(c.classIds ? { classIds: [...c.classIds] } : {}) }));
  },
};

export const classes = {
  // POST /classes — the fields beyond tutorId are still to be defined.
  async create(payload) {
    await wait();
    return { ok: true, id: `c-new-${Date.now()}`, ...payload };
  },
};

// ── Class details and sessions ──────────────────────────────────────────────

const HALLS = [
  { id: 'hall-a-maharagama', name: 'Hall A · Maharagama' },
  { id: 'hall-b-maharagama', name: 'Hall B · Maharagama' },
  { id: 'hall-c-nugegoda', name: 'Hall C · Nugegoda' },
];

const WEEKDAY_INDEX = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };

function addDays(date, days) {
  const [y, m, d] = date.split('-').map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + days));
  return next.toISOString().slice(0, 10);
}

function firstWeekdayOnOrAfter(date, weekdayName) {
  const [y, m, d] = date.split('-').map(Number);
  const current = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const wanted = WEEKDAY_INDEX[weekdayName] ?? 6;
  return addDays(date, (wanted - current + 7) % 7);
}

const SESSION_NAMES = {
  Theory: (i) => ['Kinematics', 'Projectile motion', "Newton's laws", 'Friction and inclined planes', 'Momentum and impulse', 'Circular motion'][i] || `Lesson ${i + 1}`,
  Paper: (i) => `Past paper discussion ${i + 1}`,
  Revision: (i) => `Revision session ${i + 1}`,
};

function findClass(classId) {
  for (const list of Object.values(CLASSES)) {
    const found = list.find((c) => c.id === classId);
    if (found) return found;
  }
  return null;
}

function buildSessions(cls) {
  const tutor = TUTOR_BASE.find((t) => t.id === cls.tutorId);
  const subjectCode = tutor.subject.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase();
  const count = 4 + (cls.enrolledCount % 3);
  const first = firstWeekdayOnOrAfter('2026-10-03', cls.day);
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const date = addDays(first, i * 7);
    const physical = cls.mode !== 'online' && i % 3 !== 1;
    const name = (SESSION_NAMES[cls.type] || SESSION_NAMES.Theory)(i);
    let recordingCode = null;
    if (i < 3) {
      const mmdd = date.slice(5, 7) + date.slice(8, 10);
      recordingCode = registerRecording({
        code: `REC-${subjectCode}-${mmdd}-${letters[(i * 7 + cls.enrolledCount) % letters.length]}${(i + cls.enrolledCount) % 10}`,
        title: name,
        subject: tutor.subject,
        medium: cls.medium,
        classDate: date,
        durationMins: 80 + ((i * 13 + cls.enrolledCount) % 46),
      });
    }
    out.push({
      id: `s-${cls.id}-${i + 1}`,
      name,
      access: cls.type === 'Theory' ? (i % 2 ? 'paid' : 'registered') : i % 2 ? 'paid' : 'all',
      mode: physical ? 'physical' : 'online',
      startsAt: `${date}T${cls.startTime}`,
      expiresAt: i % 3 === 2 ? null : `${addDays(date, 60)}T23:59`,
      hall: physical ? cls.hall : null,
      recordingCode,
      shares: i === 3 ? { teacher: 60, institute: 35, system: 5 } : { teacher: 70, institute: 25, system: 5 },
    });
  }
  return out;
}

const SESSIONS = {};
let sessionCounter = 0;
const sessionsOf = (classId) => {
  if (!SESSIONS[classId]) {
    const cls = findClass(classId);
    SESSIONS[classId] = cls ? buildSessions(cls) : [];
  }
  return SESSIONS[classId];
};
const copySession = (session) => ({ ...session, shares: { ...session.shares } });

export const halls = {
  // GET /halls
  async list() {
    await wait(150);
    return HALLS.map((h) => ({ ...h }));
  },
};

Object.assign(classes, {
  // GET /classes/:id
  async get(classId) {
    await wait();
    const cls = findClass(classId);
    if (!cls) return null;
    const tutor = TUTORS.find((t) => t.id === cls.tutorId);
    const total = cls.enrolledCount;
    return {
      ...cls,
      tutor: { id: tutor.id, name: tutor.name, subject: tutor.subject, photoUrl: tutor.photoUrl, mediums: [...tutor.mediums] },
      enrollments: { total, paidThisMonth: Math.round(total * 0.68), free: Math.round(total * 0.12) },
    };
  },
  // GET /classes/:id/sessions
  async sessions(classId) {
    await wait();
    return sessionsOf(classId).map(copySession);
  },
  // POST /classes/:id/sessions
  async createSession(classId, payload) {
    await wait();
    sessionCounter += 1;
    const session = { ...payload, shares: { ...payload.shares }, id: `s-new-${sessionCounter}` };
    sessionsOf(classId).push(session);
    return { ok: true, session: copySession(session) };
  },
  // PUT /classes/:id/sessions/:sessionId
  async updateSession(classId, sessionId, payload) {
    await wait();
    const list = sessionsOf(classId);
    const index = list.findIndex((s) => s.id === sessionId);
    if (index < 0) throw new Error('Session not found');
    list[index] = { ...payload, shares: { ...payload.shares }, id: sessionId };
    return { ok: true, session: copySession(list[index]) };
  },
  // DELETE /classes/:id/sessions/:sessionId
  async deleteSession(classId, sessionId) {
    await wait();
    const list = sessionsOf(classId);
    const index = list.findIndex((s) => s.id === sessionId);
    if (index >= 0) list.splice(index, 1);
    return { ok: true };
  },
});
