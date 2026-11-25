// Sample data for the teacher Instructors page until the backend exists. Kept apart from api.js so it can be thrown away.
//
// Instructor { id: 'INS-48213', name, email, addedAt: 'YYYY-MM-DD', lastActive: 'Today' }
// Directory  instructors that exist on Syzygy but are not added yet: { id, name, email, since: 'Mar 2024' }

export const SEED_INSTRUCTORS = [
  { id: 'INS-48213', name: 'Tharindu Wijesinghe', email: 'tharindu.w@gmail.com', addedAt: '2026-10-12', lastActive: 'Today' },
  { id: 'INS-30577', name: 'Nadeesha Gunawardena', email: 'nadeesha.g@gmail.com', addedAt: '2026-09-03', lastActive: 'Yesterday' },
  { id: 'INS-11902', name: 'Ruwan Karunaratne', email: 'ruwan.k@yahoo.com', addedAt: '2026-08-18', lastActive: '2 weeks ago' },
];

export const DIRECTORY = [
  { id: 'INS-52740', name: 'Hasini Rathnayake', email: 'hasini.r@gmail.com', since: 'Mar 2024' },
  { id: 'INS-60318', name: 'Chamod Senanayake', email: 'chamod.s@gmail.com', since: 'Jan 2026' },
];

// The signed-in teacher's classes. Every instructor they add can open all of these.
export const SEED_CLASSES = [
  { id: 'c1', name: '2026 A/L Theory' },
  { id: 'c2', name: '2026 A/L Paper Class' },
  { id: 'c3', name: '2027 A/L Theory' },
  { id: 'c4', name: '2026 A/L Revision' },
];
