// Mock teachers for the Reports page. Swap for an API call later
// (e.g. getTutors() from '@/lib/api-client') keeping the same shape.

export const TEACHERS = [
  { id: 'ruwan-perera', name: 'Mr. Ruwan Perera', subject: 'Physics', level: 'A/L', medium: 'Sinhala' },
  { id: 'chaminda-wickramasinghe', name: 'Mr. Chaminda Wickramasinghe', subject: 'Combined Maths', level: 'A/L', medium: 'English' },
  { id: 'hasitha-gunawardena', name: 'Dr. Hasitha Gunawardena', subject: 'Biology', level: 'A/L', medium: 'English' },
  { id: 'asela-fernando', name: 'Mr. Asela Fernando', subject: 'Accounting', level: 'A/L', medium: 'English' },
  { id: 'dilani-jayasinghe', name: 'Mrs. Dilani Jayasinghe', subject: 'Chemistry', level: 'A/L', medium: 'Sinhala' },
  { id: 'priya-sivakumar', name: 'Ms. Priya Sivakumar', subject: 'Mathematics', level: 'O/L', medium: 'Tamil' },
  { id: 'nalin-bandara', name: 'Mr. Nalin Bandara', subject: 'SFT', level: 'A/L', medium: 'Sinhala' },
  { id: 'fathima-rizvi', name: 'Mrs. Fathima Rizvi', subject: 'Economics', level: 'A/L', medium: 'Tamil' },
];

export const ALL_TEACHERS = { id: 'all', name: 'All teachers' };

export function teacherOptionLabel(teacher) {
  const level = teacher.level === 'O/L' ? 'O/L ' : '';
  return `${teacher.name} · ${level}${teacher.subject}`;
}

export function resolveTeacher(id) {
  if (!id) return null;
  if (id === ALL_TEACHERS.id) return ALL_TEACHERS;
  return TEACHERS.find((t) => t.id === id) ?? null;
}
