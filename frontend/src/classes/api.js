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
//                                  Each class also carries paymentFormat: "daily"|"monthly"|"one-time", price,
//                                  specialPrice|null (a discount; the card shows it and strikes the price) and
//                                  description|null (the class info, shown on the card). monthlyFee is the same as
//                                  price for older data.
//                                  { id, title, batchYear, level, type: "Package", medium, classIds: [classId, ...],
//                                    monthlyFee }  where monthlyFee is the package price. The page adds up the
//                                  included classes' fees itself to show the usual price and the saving, so the
//                                  package price must be lower than that sum.
//   POST /classes             -> { tutorId, ...fields to be defined }
//
//   GET  /classes/:id         -> { ...the class above, tutorId, tutor: { id, name, subject, photoUrl, mediums },
//                                  enrollments: { total, paidThisMonth, free },
//                                  and the fields the edit form uses:
//                                  subject, description, paymentFormat: "daily"|"monthly"|"one-time", price,
//                                  admissionFee, specialPrice|null, startDate: "YYYY-MM-DD", endDate|null,
//                                  shares: { teacher, institute, system }, visible: boolean,
//                                  bannerUrl|null, bannerName|null, trailerUrl|null, trailerName|null }
//                                  (null/404 when not found)
//   PUT  /classes/:id         -> { ok, cls }     multipart/form-data. Text fields: title, subject, batchYear, level,
//                                  description, paymentFormat, admissionFee, price, specialPrice (empty = none),
//                                  startDate, endDate (empty = none), shares (JSON), visible, day, startTime,
//                                  endTime. Files (optional): banner (png/jpg/webp, max 5 MB), trailer (mp4/webm/mov,
//                                  max 200 MB). removeBanner=true / removeTrailer=true delete the stored file; a file
//                                  that is not sent is kept. `cls` is the same object GET /classes/:id returns.
//   GET  /classes/:id/sessions           -> [Session]
//   POST /classes/:id/sessions           -> { session }      body: the Session fields below, without id
//   PUT  /classes/:id/sessions/:sessionId -> { session }
//   DELETE /classes/:id/sessions/:sessionId -> { ok: true }
//   GET  /halls               -> [{ id, name }]
//   GET  /classes/:id/students                 -> [Student]
//   DELETE /classes/:id/students/:studentId    -> { ok, enrollments: { total, paidThisMonth, free } }
//                                  Unenrolls the student. The response carries the class's new enrollment numbers.
//                                  (The list is searched and filtered in the page for now; for large classes the
//                                  GET can take ?search=<phone>&status=paid|free and a page number.)
//   Student = { id, name, phone: "0771234567", barcode, status: "paid"|"free"|"unpaid" }
//             paid = paid for this month, free = a free enrollment, unpaid = enrolled but not paid this month
//   GET  /classes/:id/sessions/:sessionId/participants         -> [Participant]
//   Participant = { id, name, phone: "0771234567", barcode, method: "online"|"physical",
//                   attendedAt: "2026-10-03T08:42" }      (local time, one entry per student who attended; empty
//                  until the session has started). The page searches (phone number or barcode) and filters (method)
//                  the list itself for now; for big sessions the GET can take ?search=&method=online|physical and a
//                  page number. Students stay in the history after they are unenrolled.
//   GET  /classes/:id/sessions/:sessionId/resources            -> [Resource]
//   POST /classes/:id/sessions/:sessionId/resources            -> { resource }   multipart/form-data: type, title, and
//                                  either a file (pdf/doc/docx/ppt/pptx/png/jpg/mp4/webm/mov; max 25 MB, 200 MB for video) or url
//   DELETE /classes/:id/sessions/:sessionId/resources/:resourceId -> { ok: true }
//
//   GET    /classes/:id/notices                  -> [Notice]
//   POST   /classes/:id/notices                  -> { notice }   body: { category, audience, title, body }. Publishing
//                                  creates a notification for every enrolled student the audience covers, and it
//                                  appears in their notification centre (title, body, category icon, the class and
//                                  the time). The server sets id, publishedAt and author.
//   PUT    /classes/:id/notices/:noticeId        -> { notice }   body: { category, title, body }. The students'
//                                  notifications are updated with it. The audience cannot be changed.
//   DELETE /classes/:id/notices/:noticeId        -> { ok: true } removes it from the students' notification centres
//
//   Notice = { id, category: "update"|"schedule"|"cancelled"|"material"|"exam"|"payment",
//              audience: "all"|"paid"|"free" (all enrolled / paid for this month / free enrollments),
//              title, body, publishedAt: "YYYY-MM-DDTHH:mm", updatedAt: same|null, author: "Admin" | teacher name }
//
//   Resource = { id, type: "video"|"paper"|"answers"|"notes"|"other", title, kind: "file"|"link", fileName|null,
//                size|null (bytes), url }
//   Every Session in the list also carries resourceCount.
//
//   Session = { id, name, access: "all"|"registered"|"paid", mode: "online"|"physical",
//               startsAt: "YYYY-MM-DDTHH:mm", expiresAt: "YYYY-MM-DDTHH:mm"|null, hall: string|null,
//               recordingCode: "REC-PHY-0614-K7"|null, shares: { teacher, institute, system },
//               resourceCount }  (shares in %, total 100)
//   Business errors should come back as 200 + { isSuccess: false, message } like the rest of the app, because
//   a 401/403 is read as an expired login.

import { registerRecording } from './recordings';
import { nowLocal } from './sessionUtils';

const DEFAULT_SHARES_MOCK = { teacher: 70, institute: 25, system: 5 };
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
    // A class carries what was set when it was edited: payment format, price, special price and class info.
    const own = (CLASSES[id] || []).map((c) => {
      const { description, paymentFormat, price, specialPrice, admissionFee, visible } = CLASS_EXTRA[c.id] || {};
      return { ...c, ...(CLASS_EXTRA[c.id] ? { description, paymentFormat, price, specialPrice, admissionFee, visible } : {}) };
    });
    return [...own, ...(PACKAGES[id] || []).map((c) => ({ ...c, classIds: [...c.classIds] }))];
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
    // A few sessions already have material, so the Resources button shows a count.
    SESSIONS[classId].forEach((session, i) => {
      const list = resourcesOf(session.id);
      if (i === 0) {
        list.push({ id: `r-${session.id}-1`, type: 'paper', title: `${session.name} — worksheet`, kind: 'file', fileName: 'worksheet.pdf', size: 482000, url: '#' });
        list.push({ id: `r-${session.id}-2`, type: 'answers', title: `${session.name} — answer sheet`, kind: 'file', fileName: 'answers.pdf', size: 236000, url: '#' });
      }
      if (i === 1) list.push({ id: `r-${session.id}-1`, type: 'video', title: 'Worked examples', kind: 'link', fileName: null, size: null, url: 'https://www.youtube.com/watch?v=example' });
    });
  }
  return SESSIONS[classId];
};
const RESOURCES = {}; // sessionId -> [Resource]
let resourceCounter = 0;
const resourcesOf = (sessionId) => (RESOURCES[sessionId] = RESOURCES[sessionId] || []);
const copySession = (session) => ({ ...session, shares: { ...session.shares }, resourceCount: resourcesOf(session.id).length });
const copyResource = (resource) => ({ ...resource });
const objectUrl = (file) => (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : '');

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
    return cls ? classView(cls) : null;
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
    if (index >= 0) {
      delete RESOURCES[list[index].id];
      list.splice(index, 1);
    }
    return { ok: true };
  },
});

// ── Editing a class ─────────────────────────────────────────────────────────

const CLASS_EXTRA = {}; // classId -> the fields the edit form adds to a class

// ── Students of a class ─────────────────────────────────────────────────────

const FIRST_NAMES = ['Kavindu', 'Nimali', 'Sachini', 'Tharindu', 'Dinuka', 'Hasini', 'Ravindu', 'Amaya', 'Pasindu', 'Ishara', 'Lakshan', 'Oshadi', 'Chamod', 'Methmi', 'Yasiru', 'Piumi', 'Nethmi', 'Sandun', 'Kaveesha', 'Dilshan', 'Thisara', 'Anjana', 'Sahan', 'Rashmi'];
const LAST_NAMES = ['Perera', 'Fernando', 'Silva', 'Jayawardena', 'Gunasekara', 'Wickramasinghe', 'Rajapaksha', 'Senanayake', 'Dissanayake', 'Herath', 'Bandara', 'Karunaratne', 'Abeysekara', 'Ranasinghe', 'Weerasinghe'];
const PHONE_PREFIX = ['070', '071', '072', '074', '075', '076', '077', '078'];

const hashOf = (text) => [...String(text)].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) % 100003, 7);

function buildStudents(cls) {
  const total = cls.enrolledCount;
  const paid = Math.round(total * 0.68);
  const free = Math.round(total * 0.12);
  const seed = hashOf(cls.id);
  // statuses mixed in a fixed order
  const statuses = [...Array(paid).fill('paid'), ...Array(free).fill('free'), ...Array(total - paid - free).fill('unpaid')];
  let x = seed;
  for (let i = statuses.length - 1; i > 0; i -= 1) {
    x = (x * 1103515245 + 12345) % 2147483648;
    const j = x % (i + 1);
    [statuses[i], statuses[j]] = [statuses[j], statuses[i]];
  }
  return statuses
    .map((status, i) => ({
      id: `st-${cls.id}-${i + 1}`,
      name: `${FIRST_NAMES[(i * 7 + seed) % FIRST_NAMES.length]} ${LAST_NAMES[(i * 11 + seed * 3) % LAST_NAMES.length]}`,
      phone: `${PHONE_PREFIX[(i + seed) % PHONE_PREFIX.length]}${String((seed * 7919 + i * 100003) % 10000000).padStart(7, '0')}`,
      barcode: `SYZ${String(240000 + (seed % 50) * 1000 + i)}`,
      status,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

const STUDENTS = {};
const studentsOf = (classId) => {
  if (!STUDENTS[classId]) {
    const cls = findClass(classId);
    STUDENTS[classId] = cls ? buildStudents(cls) : [];
  }
  return STUDENTS[classId];
};

// ── Participants of a session ───────────────────────────────────────────────

function addMinutes(local, minutes) {
  const [date, time] = local.split('T');
  const [h, m] = time.split(':').map(Number);
  const total = Math.max(0, h * 60 + m + minutes);
  const days = Math.floor(total / 1440);
  return `${days ? addDays(date, days) : date}T${pad2(Math.floor((total % 1440) / 60))}:${pad2(total % 60)}`;
}

// Mock attendance: a deterministic share of the class's students. In a physical session most come to the hall and
// some watch online; an online session is all online. Physical students arrive around the start, online ones join up
// to 45 minutes in. (Built from the students currently enrolled; a real history would keep unenrolled students too.)
function buildParticipants(classId, session) {
  if (!session.startsAt || session.startsAt > nowLocal()) return [];
  const seed = hashOf(session.id);
  const rate = 60 + (seed % 26);
  const out = [];
  studentsOf(classId).forEach((student) => {
    const h = hashOf(`${student.id}|${session.id}`);
    if (h % 100 >= rate) return;
    const method = session.mode === 'physical' && h % 10 < 7 ? 'physical' : 'online';
    const offset = method === 'physical' ? -((h >> 3) % 15) + (h % 6) : (h >> 2) % 46;
    out.push({ id: `p-${session.id}-${student.id}`, name: student.name, phone: student.phone, barcode: student.barcode, method, attendedAt: addMinutes(session.startsAt, offset) });
  });
  return out.sort((a, b) => a.attendedAt.localeCompare(b.attendedAt) || a.name.localeCompare(b.name));
}

const enrollmentsOf = (classId) => {
  const list = studentsOf(classId);
  return {
    total: list.length,
    paidThisMonth: list.filter((x) => x.status === 'paid').length,
    free: list.filter((x) => x.status === 'free').length,
  };
};

function classView(cls) {
  const tutor = TUTORS.find((t) => t.id === cls.tutorId);
  const extra = CLASS_EXTRA[cls.id] || {};
  return {
    subject: tutor.subject,
    description: '',
    paymentFormat: 'monthly',
    price: cls.monthlyFee,
    admissionFee: 0,
    specialPrice: null,
    startDate: '2026-01-10',
    endDate: null,
    visible: true,
    bannerUrl: null,
    bannerName: null,
    trailerUrl: null,
    trailerName: null,
    ...cls,
    ...extra,
    shares: { ...(extra.shares || DEFAULT_SHARES_MOCK) },
    tutor: { id: tutor.id, name: tutor.name, subject: tutor.subject, photoUrl: tutor.photoUrl, mediums: [...tutor.mediums] },
    enrollments: enrollmentsOf(cls.id),
  };
}

Object.assign(classes, {
  // PUT /classes/:id
  async update(classId, payload) {
    await wait(500);
    const cls = findClass(classId);
    if (!cls) throw new Error('Class not found');
    const extra = { ...(CLASS_EXTRA[classId] || {}) };
    // The fields the tutor pages already read are kept in step.
    Object.assign(cls, {
      title: payload.title,
      batchYear: payload.batchYear,
      level: payload.level,
      day: payload.day,
      startTime: payload.startTime,
      endTime: payload.endTime,
      monthlyFee: payload.price,
    });
    for (const key of ['subject', 'description', 'paymentFormat', 'price', 'admissionFee', 'specialPrice', 'startDate', 'endDate', 'visible']) {
      extra[key] = payload[key];
    }
    extra.shares = { ...payload.shares };
    for (const [key, field] of [['banner', 'banner'], ['trailer', 'trailer']]) {
      const change = payload[key];
      if (change?.file) {
        extra[`${field}Url`] = objectUrl(change.file) || '#';
        extra[`${field}Name`] = change.file.name;
      } else if (change?.remove) {
        extra[`${field}Url`] = null;
        extra[`${field}Name`] = null;
      }
    }
    CLASS_EXTRA[classId] = extra;
    return { ok: true, cls: classView(cls) };
  },
});

Object.assign(classes, {
  // GET /classes/:id/students
  async students(classId) {
    await wait(300);
    return studentsOf(classId).map((x) => ({ ...x }));
  },
  // GET /classes/:id/sessions/:sessionId/participants
  async participants(classId, sessionId) {
    await wait();
    const session = sessionsOf(classId).find((x) => x.id === sessionId);
    if (!session) throw new Error('Session not found');
    return buildParticipants(classId, session);
  },
  // DELETE /classes/:id/students/:studentId — the class's and the tutor's student numbers go down with it.
  async unenroll(classId, studentId) {
    await wait(400);
    const list = studentsOf(classId);
    const index = list.findIndex((x) => x.id === studentId);
    if (index >= 0) {
      list.splice(index, 1);
      const cls = findClass(classId);
      cls.enrolledCount = list.length;
      const tutor = TUTORS.find((t) => t.id === cls.tutorId);
      tutor.studentCount = Math.max(0, tutor.studentCount - 1);
    }
    return { ok: true, enrollments: enrollmentsOf(classId) };
  },
});

// ── Notices ─────────────────────────────────────────────────────────────────

const NOTICES = {}; // classId -> [Notice]
let noticeCounter = 0;
const noticesOf = (classId) => {
  if (!NOTICES[classId]) {
    // The first class of each tutor already has two notices.
    NOTICES[classId] = /-1$/.test(classId)
      ? [
          { id: `n-${classId}-1`, category: 'schedule', audience: 'all', title: 'This Saturday’s class is at Hall B', body: 'Hall A is being repaired, so this Saturday’s class will be held at Hall B, Maharagama. The time stays the same.\nPlease arrive 10 minutes early.', publishedAt: '2026-11-07T18:30', updatedAt: null, author: 'Admin' },
          { id: `n-${classId}-2`, category: 'payment', audience: 'free', title: 'Your free access ends this month', body: 'Your free enrollment in this class ends on 30 November. To keep attending, please complete your payment before the next session.', publishedAt: '2026-10-28T09:15', updatedAt: '2026-10-28T10:02', author: 'Admin' },
        ]
      : [];
  }
  return NOTICES[classId];
};
const copyNotice = (notice) => ({ ...notice });
const pad2 = (n) => String(n).padStart(2, '0');
const nowStamp = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

Object.assign(classes, {
  // GET /classes/:id/notices
  async notices(classId) {
    await wait(250);
    return noticesOf(classId).map(copyNotice);
  },
  // POST /classes/:id/notices
  async createNotice(classId, payload) {
    await wait(500);
    noticeCounter += 1;
    const notice = { id: `n-new-${noticeCounter}`, ...payload, publishedAt: nowStamp(), updatedAt: null, author: 'Admin' };
    noticesOf(classId).push(notice);
    return { ok: true, notice: copyNotice(notice) };
  },
  // PUT /classes/:id/notices/:noticeId — the audience stays as it was.
  async updateNotice(classId, noticeId, payload) {
    await wait(500);
    const list = noticesOf(classId);
    const index = list.findIndex((n) => n.id === noticeId);
    if (index < 0) throw new Error('Notice not found');
    list[index] = { ...list[index], category: payload.category, title: payload.title, body: payload.body, updatedAt: nowStamp() };
    return { ok: true, notice: copyNotice(list[index]) };
  },
  // DELETE /classes/:id/notices/:noticeId
  async deleteNotice(classId, noticeId) {
    await wait(300);
    const list = noticesOf(classId);
    const index = list.findIndex((n) => n.id === noticeId);
    if (index >= 0) list.splice(index, 1);
    return { ok: true };
  },
});

// ── Session resources ───────────────────────────────────────────────────────

Object.assign(classes, {
  // GET /classes/:id/sessions/:sessionId/resources
  async resources(classId, sessionId) {
    await wait(250);
    return resourcesOf(sessionId).map(copyResource);
  },
  // POST /classes/:id/sessions/:sessionId/resources
  async addResource(classId, sessionId, payload) {
    await wait(500);
    resourceCounter += 1;
    const file = payload.kind === 'file' ? payload.file : null;
    const resource = {
      id: `r-new-${resourceCounter}`,
      type: payload.type,
      title: payload.title,
      kind: payload.kind,
      fileName: file ? file.name : null,
      size: file ? file.size : null,
      url: file ? objectUrl(file) || '#' : payload.url,
    };
    resourcesOf(sessionId).push(resource);
    return { ok: true, resource: copyResource(resource) };
  },
  // DELETE /classes/:id/sessions/:sessionId/resources/:resourceId
  async deleteResource(classId, sessionId, resourceId) {
    await wait(300);
    const list = resourcesOf(sessionId);
    const index = list.findIndex((r) => r.id === resourceId);
    if (index >= 0) list.splice(index, 1);
    return { ok: true };
  },
});
