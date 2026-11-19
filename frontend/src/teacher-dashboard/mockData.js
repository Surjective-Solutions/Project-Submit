// Sample data for the teacher's dashboard. Everything on the page is read from this one object, so swapping it for the
// real API (see api.js) changes nothing else. The times, dates and numbers below are only samples.
//
// `asOf` is "now" on the server (local time). The greeting, "Today", "In 20 min" and the week strip are all worked out
// from it, so the page always agrees with itself.

export const dashboardData = {
  asOf: '2026-11-19T13:40',
  teacher: { name: 'Kasun Silva', firstName: 'Kasun', subject: 'Combined Maths' },

  // Today's sessions, in time order. `mode` is "hall" or "online". `status` dots: tone is positive | negative | navy.
  today: [
    {
      id: 's-paper-13',
      classId: 'c-2026-paper',
      title: '2026 A/L Paper Class',
      mode: 'hall',
      start: '14:00',
      end: '17:00',
      detail: 'Paper 13 — Mechanics · Vidya Hall, Maharagama · 164 enrolled',
      status: [
        { tone: 'positive', text: '139 paid for November' },
        { tone: 'negative', text: '25 fees due' },
        { tone: 'navy', text: 'Paper + answer sheet ready' },
      ],
    },
    {
      id: 's-qa-differentiation',
      classId: 'c-2027-theory',
      title: '2027 A/L Theory',
      mode: 'online',
      start: '19:00',
      end: '20:30',
      detail: 'Q&A — Differentiation · 146 enrolled',
      joinLink: 'https://zoom.us/j/0000000000',
      status: [],
    },
  ],

  // This month's fees, per class. paid + due = students.
  fees: {
    month: 'November',
    classes: [
      { name: '2026 A/L Theory', paid: 143, total: 182 },
      { name: '2026 A/L Paper Class', paid: 139, total: 164 },
      { name: '2027 A/L Theory', paid: 98, total: 146 },
      { name: '2026 A/L Revision', paid: 168, total: 210 },
    ],
  },

  classes: [
    { id: 'c-2026-theory', name: '2026 A/L Theory', venue: 'Sipwin Hall, Nugegoda', schedule: 'Mon 4.00–7.00 pm', mode: 'hall', students: 182 },
    { id: 'c-2026-paper', name: '2026 A/L Paper Class', venue: 'Vidya Hall, Maharagama', schedule: 'Thu 2.00–5.00 pm', mode: 'hall', students: 164 },
    { id: 'c-2027-theory', name: '2027 A/L Theory', venue: 'Zoom', schedule: 'Tue · Sun', mode: 'online', students: 146 },
    { id: 'c-2026-revision', name: '2026 A/L Revision', venue: 'Vidya Hall, Maharagama', schedule: 'Sat 8.00 am–12 pm', mode: 'hall', students: 210 },
  ],

  // The 7 days of the current week, Monday first. `sessions` are the modes of that day's sessions.
  week: {
    days: [
      { date: '2026-11-16', sessions: ['hall'] },
      { date: '2026-11-17', sessions: ['online'] },
      { date: '2026-11-18', sessions: [] },
      { date: '2026-11-19', sessions: ['hall', 'online'] },
      { date: '2026-11-20', sessions: [] },
      { date: '2026-11-21', sessions: ['hall'] },
      { date: '2026-11-22', sessions: ['online'] },
    ],
    comingUp: [
      { id: 'u1', date: '2026-11-21', title: '2026 A/L Revision', time: '8.00 am', place: 'Maharagama' },
      { id: 'u2', date: '2026-11-22', title: '2027 A/L Theory', time: '1.30 pm', place: 'Zoom' },
      { id: 'u3', date: '2026-11-23', title: '2026 A/L Theory', time: '4.00 pm', place: 'Nugegoda' },
    ],
  },

  notices: [
    { id: 'n1', title: 'Paper 12 answers and marking scheme uploaded', sub: '2026 A/L Paper Class · 2 hours ago' },
    { id: 'n2', title: 'Tonight’s Q&A moves to 7.00 pm — same Zoom link', sub: '2027 A/L Theory · Yesterday' },
    { id: 'n3', title: 'Bring a calculator and the formula sheet on Saturday', sub: '2026 A/L Revision · Mon 16 Nov' },
  ],

};
