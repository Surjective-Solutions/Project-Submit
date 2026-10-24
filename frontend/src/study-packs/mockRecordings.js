// Mock "Class Recordings" data. The real list lives in the Class Recordings section;
// this file only stands in for it until the backend exists.
//
// Recording { code, teacherId, subject, grade, medium, title, classDate (YYYY-MM-DD), durationMins, thumbnailUrl? }
// Code format: REC-{SUBJ}-{MMDD}-{XX}, e.g. REC-PHY-0614-K7
// To add a recording, copy a line and change its code, title, date and duration.

export const RECORDINGS = [
  // Physics — teacherId 1
  { code: 'REC-PHY-0503-LU', teacherId: '1', subject: 'Physics', grade: 'Grade 13 · A/L 2026', medium: 'Sinhala', title: 'Kinematics', classDate: '2026-05-03', durationMins: 97 },
  { code: 'REC-PHY-0510-T9', teacherId: '1', subject: 'Physics', grade: 'Grade 13 · A/L 2026', medium: 'Sinhala', title: 'Projectile motion', classDate: '2026-05-10', durationMins: 125 },
  { code: 'REC-PHY-0517-2N', teacherId: '1', subject: 'Physics', grade: 'Grade 13 · A/L 2026', medium: 'Sinhala', title: 'Newton\'s laws', classDate: '2026-05-17', durationMins: 107 },
  { code: 'REC-PHY-0524-93', teacherId: '1', subject: 'Physics', grade: 'Grade 13 · A/L 2026', medium: 'Sinhala', title: 'Friction & inclined planes', classDate: '2026-05-24', durationMins: 89 },
  { code: 'REC-PHY-0531-GG', teacherId: '1', subject: 'Physics', grade: 'Grade 13 · A/L 2026', medium: 'Sinhala', title: 'Momentum & impulse', classDate: '2026-05-31', durationMins: 117 },
  { code: 'REC-PHY-0607-PV', teacherId: '1', subject: 'Physics', grade: 'Grade 13 · A/L 2026', medium: 'Sinhala', title: 'Circular motion', classDate: '2026-06-07', durationMins: 99 },
  { code: 'REC-PHY-0614-K7', teacherId: '1', subject: 'Physics', grade: 'Grade 13 · A/L 2026', medium: 'Sinhala', title: 'Electric fields', classDate: '2026-06-14', durationMins: 81 },
  { code: 'REC-PHY-0621-5P', teacherId: '1', subject: 'Physics', grade: 'Grade 13 · A/L 2026', medium: 'Sinhala', title: 'Capacitors', classDate: '2026-06-21', durationMins: 109 },

  // Combined Maths — teacherId 2
  { code: 'REC-CMA-0504-C4', teacherId: '2', subject: 'Combined Maths', grade: 'Grade 13 · A/L 2026', medium: 'Sinhala', title: 'Functions & graphs', classDate: '2026-05-04', durationMins: 95 },
  { code: 'REC-CMA-0511-KH', teacherId: '2', subject: 'Combined Maths', grade: 'Grade 13 · A/L 2026', medium: 'Sinhala', title: 'Limits & continuity', classDate: '2026-05-11', durationMins: 123 },
  { code: 'REC-CMA-0518-SW', teacherId: '2', subject: 'Combined Maths', grade: 'Grade 13 · A/L 2026', medium: 'Sinhala', title: 'Differentiation', classDate: '2026-05-18', durationMins: 105 },
  { code: 'REC-CMA-0525-ZB', teacherId: '2', subject: 'Combined Maths', grade: 'Grade 13 · A/L 2026', medium: 'Sinhala', title: 'Applications of derivatives', classDate: '2026-05-25', durationMins: 87 },
  { code: 'REC-CMA-0601-8Q', teacherId: '2', subject: 'Combined Maths', grade: 'Grade 13 · A/L 2026', medium: 'Sinhala', title: 'Integration', classDate: '2026-06-01', durationMins: 115 },
  { code: 'REC-CMA-0608-F5', teacherId: '2', subject: 'Combined Maths', grade: 'Grade 13 · A/L 2026', medium: 'Sinhala', title: 'Vectors', classDate: '2026-06-08', durationMins: 97 },
  { code: 'REC-CMA-0615-NJ', teacherId: '2', subject: 'Combined Maths', grade: 'Grade 13 · A/L 2026', medium: 'Sinhala', title: 'Complex numbers', classDate: '2026-06-15', durationMins: 125 },
  { code: 'REC-CMA-0622-VX', teacherId: '2', subject: 'Combined Maths', grade: 'Grade 13 · A/L 2026', medium: 'Sinhala', title: 'Coordinate geometry', classDate: '2026-06-22', durationMins: 107 },

  // Chemistry — teacherId 3
  { code: 'REC-CHE-0505-4C', teacherId: '3', subject: 'Chemistry', grade: 'Grade 13 · A/L 2026', medium: 'English', title: 'Atomic structure', classDate: '2026-05-05', durationMins: 93 },
  { code: 'REC-CHE-0512-BR', teacherId: '3', subject: 'Chemistry', grade: 'Grade 13 · A/L 2026', medium: 'English', title: 'Chemical bonding', classDate: '2026-05-12', durationMins: 121 },
  { code: 'REC-CHE-0519-J6', teacherId: '3', subject: 'Chemistry', grade: 'Grade 13 · A/L 2026', medium: 'English', title: 'Mole concept', classDate: '2026-05-19', durationMins: 103 },
  { code: 'REC-CHE-0526-RK', teacherId: '3', subject: 'Chemistry', grade: 'Grade 13 · A/L 2026', medium: 'English', title: 'Thermochemistry', classDate: '2026-05-26', durationMins: 85 },
  { code: 'REC-CHE-0602-YY', teacherId: '3', subject: 'Chemistry', grade: 'Grade 13 · A/L 2026', medium: 'English', title: 'Chemical equilibrium', classDate: '2026-06-02', durationMins: 113 },
  { code: 'REC-CHE-0609-7D', teacherId: '3', subject: 'Chemistry', grade: 'Grade 13 · A/L 2026', medium: 'English', title: 'Acids & bases', classDate: '2026-06-09', durationMins: 95 },
  { code: 'REC-CHE-0616-ES', teacherId: '3', subject: 'Chemistry', grade: 'Grade 13 · A/L 2026', medium: 'English', title: 'Electrochemistry', classDate: '2026-06-16', durationMins: 123 },
  { code: 'REC-CHE-0623-M7', teacherId: '3', subject: 'Chemistry', grade: 'Grade 13 · A/L 2026', medium: 'English', title: 'Organic chemistry basics', classDate: '2026-06-23', durationMins: 105 },

  // Mathematics (O/L) — teacherId 4
  { code: 'REC-MAT-0506-UL', teacherId: '4', subject: 'Mathematics (O/L)', grade: 'Grade 11 · O/L 2026', medium: 'Tamil', title: 'Algebraic expressions', classDate: '2026-05-06', durationMins: 91 },
  { code: 'REC-MAT-0513-3Z', teacherId: '4', subject: 'Mathematics (O/L)', grade: 'Grade 11 · O/L 2026', medium: 'Tamil', title: 'Equations & inequalities', classDate: '2026-05-13', durationMins: 119 },
  { code: 'REC-MAT-0520-AE', teacherId: '4', subject: 'Mathematics (O/L)', grade: 'Grade 11 · O/L 2026', medium: 'Tamil', title: 'Percentages', classDate: '2026-05-20', durationMins: 101 },
  { code: 'REC-MAT-0527-HT', teacherId: '4', subject: 'Mathematics (O/L)', grade: 'Grade 11 · O/L 2026', medium: 'Tamil', title: 'Ratios & proportion', classDate: '2026-05-27', durationMins: 83 },
  { code: 'REC-MAT-0603-Q8', teacherId: '4', subject: 'Mathematics (O/L)', grade: 'Grade 11 · O/L 2026', medium: 'Tamil', title: 'Geometry', classDate: '2026-06-03', durationMins: 111 },
  { code: 'REC-MAT-0610-XM', teacherId: '4', subject: 'Mathematics (O/L)', grade: 'Grade 11 · O/L 2026', medium: 'Tamil', title: 'Mensuration', classDate: '2026-06-10', durationMins: 93 },
  { code: 'REC-MAT-0617-62', teacherId: '4', subject: 'Mathematics (O/L)', grade: 'Grade 11 · O/L 2026', medium: 'Tamil', title: 'Trigonometry', classDate: '2026-06-17', durationMins: 121 },
  { code: 'REC-MAT-0624-DF', teacherId: '4', subject: 'Mathematics (O/L)', grade: 'Grade 11 · O/L 2026', medium: 'Tamil', title: 'Statistics', classDate: '2026-06-24', durationMins: 103 },

  // Biology — teacherId 5
  { code: 'REC-BIO-0507-LU', teacherId: '5', subject: 'Biology', grade: 'Grade 12 · A/L 2027', medium: 'Sinhala', title: 'Cell structure', classDate: '2026-05-07', durationMins: 89 },
  { code: 'REC-BIO-0514-T9', teacherId: '5', subject: 'Biology', grade: 'Grade 12 · A/L 2027', medium: 'Sinhala', title: 'Biomolecules', classDate: '2026-05-14', durationMins: 117 },
  { code: 'REC-BIO-0521-2N', teacherId: '5', subject: 'Biology', grade: 'Grade 12 · A/L 2027', medium: 'Sinhala', title: 'Enzymes', classDate: '2026-05-21', durationMins: 99 },
  { code: 'REC-BIO-0528-93', teacherId: '5', subject: 'Biology', grade: 'Grade 12 · A/L 2027', medium: 'Sinhala', title: 'Photosynthesis', classDate: '2026-05-28', durationMins: 81 },
  { code: 'REC-BIO-0604-GG', teacherId: '5', subject: 'Biology', grade: 'Grade 12 · A/L 2027', medium: 'Sinhala', title: 'Respiration', classDate: '2026-06-04', durationMins: 109 },
  { code: 'REC-BIO-0611-PV', teacherId: '5', subject: 'Biology', grade: 'Grade 12 · A/L 2027', medium: 'Sinhala', title: 'Genetics', classDate: '2026-06-11', durationMins: 91 },
  { code: 'REC-BIO-0618-WA', teacherId: '5', subject: 'Biology', grade: 'Grade 12 · A/L 2027', medium: 'Sinhala', title: 'Evolution', classDate: '2026-06-18', durationMins: 119 },
  { code: 'REC-BIO-0625-5P', teacherId: '5', subject: 'Biology', grade: 'Grade 12 · A/L 2027', medium: 'Sinhala', title: 'Ecology', classDate: '2026-06-25', durationMins: 101 },

  // Accounting — teacherId 6
  { code: 'REC-ACC-0508-C4', teacherId: '6', subject: 'Accounting', grade: 'Grade 13 · A/L 2026', medium: 'English', title: 'Double-entry bookkeeping', classDate: '2026-05-08', durationMins: 87 },
  { code: 'REC-ACC-0515-KH', teacherId: '6', subject: 'Accounting', grade: 'Grade 13 · A/L 2026', medium: 'English', title: 'Trial balance', classDate: '2026-05-15', durationMins: 115 },
  { code: 'REC-ACC-0522-SW', teacherId: '6', subject: 'Accounting', grade: 'Grade 13 · A/L 2026', medium: 'English', title: 'Final accounts', classDate: '2026-05-22', durationMins: 97 },
  { code: 'REC-ACC-0529-ZB', teacherId: '6', subject: 'Accounting', grade: 'Grade 13 · A/L 2026', medium: 'English', title: 'Depreciation', classDate: '2026-05-29', durationMins: 125 },
  { code: 'REC-ACC-0605-8Q', teacherId: '6', subject: 'Accounting', grade: 'Grade 13 · A/L 2026', medium: 'English', title: 'Bank reconciliation', classDate: '2026-06-05', durationMins: 107 },
  { code: 'REC-ACC-0612-F5', teacherId: '6', subject: 'Accounting', grade: 'Grade 13 · A/L 2026', medium: 'English', title: 'Partnership accounts', classDate: '2026-06-12', durationMins: 89 },
  { code: 'REC-ACC-0619-NJ', teacherId: '6', subject: 'Accounting', grade: 'Grade 13 · A/L 2026', medium: 'English', title: 'Company accounts', classDate: '2026-06-19', durationMins: 117 },
  { code: 'REC-ACC-0626-VX', teacherId: '6', subject: 'Accounting', grade: 'Grade 13 · A/L 2026', medium: 'English', title: 'Cash flow statements', classDate: '2026-06-26', durationMins: 99 },

  // SFT — teacherId 7
  { code: 'REC-SFT-0509-4C', teacherId: '7', subject: 'SFT', grade: 'Grade 12 · A/L 2027', medium: 'Sinhala', title: 'Measurements', classDate: '2026-05-09', durationMins: 85 },
  { code: 'REC-SFT-0516-BR', teacherId: '7', subject: 'SFT', grade: 'Grade 12 · A/L 2027', medium: 'Sinhala', title: 'Forces & motion', classDate: '2026-05-16', durationMins: 113 },
  { code: 'REC-SFT-0523-J6', teacherId: '7', subject: 'SFT', grade: 'Grade 12 · A/L 2027', medium: 'Sinhala', title: 'Materials', classDate: '2026-05-23', durationMins: 95 },
  { code: 'REC-SFT-0530-RK', teacherId: '7', subject: 'SFT', grade: 'Grade 12 · A/L 2027', medium: 'Sinhala', title: 'Heat & temperature', classDate: '2026-05-30', durationMins: 123 },
  { code: 'REC-SFT-0606-YY', teacherId: '7', subject: 'SFT', grade: 'Grade 12 · A/L 2027', medium: 'Sinhala', title: 'Basic electricity', classDate: '2026-06-06', durationMins: 105 },
  { code: 'REC-SFT-0613-7D', teacherId: '7', subject: 'SFT', grade: 'Grade 12 · A/L 2027', medium: 'Sinhala', title: 'Energy sources', classDate: '2026-06-13', durationMins: 87 },
  { code: 'REC-SFT-0620-ES', teacherId: '7', subject: 'SFT', grade: 'Grade 12 · A/L 2027', medium: 'Sinhala', title: 'Biotechnology', classDate: '2026-06-20', durationMins: 115 },
  { code: 'REC-SFT-0627-M7', teacherId: '7', subject: 'SFT', grade: 'Grade 12 · A/L 2027', medium: 'Sinhala', title: 'Environment & technology', classDate: '2026-06-27', durationMins: 97 },
];

export function findRecording(code) {
  return RECORDINGS.find((r) => r.code === code) ?? null;
}

// Oldest class first. Used to fill in the sessions of the seeded sample packs.
export function listRecordingsFor(teacherId, subject) {
  return RECORDINGS.filter((r) => String(r.teacherId) === String(teacherId) && r.subject === subject).sort((a, b) =>
    a.classDate.localeCompare(b.classDate)
  );
}