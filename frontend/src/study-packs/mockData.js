// Mock data for the Study Packs page. Replaced by real endpoints later (see api.js).
//
// StudyPack {
//   id, name, description, teacherId, grade, subject, price,
//   validity: '1m' | '3m' | '6m' | 'exam' | 'custom', customDays?,
//   shares: { teacher, institute, system }, coverUrl?,
//   status: 'draft' | 'published', sessions, totalDuration (minutes), sold, updatedAt (ISO)
// }

function daysAgo(n) {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

const SHARES = { teacher: 70, institute: 25, system: 5 };

export const SEED_TEACHERS = [
  { id: '1', name: 'Mr. Ruwan Perera', subject: 'Physics' },
  { id: '2', name: 'Mr. C. Wickramasinghe', subject: 'Combined Maths' },
  { id: '3', name: 'Mrs. D. Jayasinghe', subject: 'Chemistry' },
  { id: '4', name: 'Ms. P. Sivakumar', subject: 'Mathematics (O/L)' },
  { id: '5', name: 'Mrs. N. Fernando', subject: 'Biology' },
  { id: '6', name: 'Mr. A. Bandara', subject: 'Accounting' },
  { id: '7', name: 'Mr. K. Rathnayake', subject: 'SFT' },
];

export const SEED_PACKS = [
  {
    id: 'sp-1',
    name: 'Mechanics — Motion & Forces',
    description:
      'Every mechanics session from the term, from kinematics to Newton’s laws, with worked past-paper questions.',
    teacherId: '1',
    grade: 'Grade 13 · A/L 2026',
    subject: 'Physics',
    price: 4500,
    validity: '6m',
    shares: SHARES,
    status: 'published',
    sessions: 6,
    totalDuration: 580,
    sold: 182,
    updatedAt: daysAgo(12),
  },
  {
    id: 'sp-2',
    name: 'Electricity & Magnetism',
    description:
      'Electric fields, circuits and magnetic effects, recorded live with full derivations and exam-style practice.',
    teacherId: '1',
    grade: 'Grade 13 · A/L 2026',
    subject: 'Physics',
    price: 5500,
    validity: 'exam',
    shares: SHARES,
    status: 'published',
    sessions: 8,
    totalDuration: 765,
    sold: 240,
    updatedAt: daysAgo(20),
  },
  {
    id: 'sp-3',
    name: 'Differentiation — Complete Unit',
    description:
      'First principles to applications: limits, rules, curve sketching and optimisation, step by step.',
    teacherId: '2',
    grade: 'Grade 12 · A/L 2027',
    subject: 'Combined Maths',
    price: 3800,
    validity: '3m',
    shares: SHARES,
    status: 'published',
    sessions: 5,
    totalDuration: 440,
    sold: 96,
    updatedAt: daysAgo(9),
  },
  {
    id: 'sp-4',
    name: 'Organic Chemistry Part I',
    description:
      'Nomenclature, isomerism and reaction mechanisms for the first half of the organic syllabus.',
    teacherId: '3',
    grade: 'Grade 13 · A/L 2026',
    subject: 'Chemistry',
    price: 4200,
    validity: '6m',
    shares: SHARES,
    status: 'published',
    sessions: 7,
    totalDuration: 560,
    sold: 131,
    updatedAt: daysAgo(15),
  },
  {
    id: 'sp-5',
    name: 'Algebra Revision',
    description:
      'Equations, inequalities and factorising, covered quickly for students catching up before the term test.',
    teacherId: '4',
    grade: 'Grade 11 · O/L 2026',
    subject: 'Mathematics (O/L)',
    price: 2500,
    validity: '1m',
    shares: SHARES,
    status: 'published',
    sessions: 4,
    totalDuration: 300,
    sold: 58,
    updatedAt: daysAgo(6),
  },
  {
    id: 'sp-6',
    name: 'Cell Biology & Genetics',
    description:
      'Cell structure, division and inheritance with labelled diagrams and past-paper walkthroughs.',
    teacherId: '5',
    grade: 'Grade 13 · A/L 2026',
    subject: 'Biology',
    price: 4000,
    validity: '6m',
    shares: SHARES,
    status: 'draft',
    sessions: 3,
    totalDuration: 215,
    sold: 0,
    updatedAt: daysAgo(2),
  },
  {
    id: 'sp-7',
    name: 'Partnership Accounts',
    description:
      'Admission, retirement and dissolution of a partnership, with full worked solutions.',
    teacherId: '6',
    grade: 'Grade 12 · A/L 2027',
    subject: 'Accounting',
    price: 3500,
    validity: '3m',
    shares: SHARES,
    status: 'draft',
    sessions: 2,
    totalDuration: 150,
    sold: 0,
    updatedAt: daysAgo(5),
  },
  {
    id: 'sp-8',
    name: 'SFT — Electricity Basics',
    description:
      'Introductory electricity for the SFT syllabus: circuits, measurements and safety.',
    teacherId: '7',
    grade: 'Grade 12 · A/L 2027',
    subject: 'SFT',
    price: 3000,
    validity: '3m',
    shares: SHARES,
    status: 'draft',
    sessions: 0,
    totalDuration: 0,
    sold: 0,
    updatedAt: daysAgo(1),
  },
];
