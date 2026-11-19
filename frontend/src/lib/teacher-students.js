import { protectedRequestPath } from '@/lib/api-client';

// The students of the signed-in teacher: those enrolled in at least one of the teacher's own classes.
//
//   GET /api/teacher-student/my-students  ->  [Student]
//
// The server finds the teacher from the access token and answers only with students enrolled in that teacher's
// classes. It must not take a teacher id from the request, and it must leave out what a teacher does not see
// (NIC number, address, device lock details, payment data). A tutor-role token must be allowed on this route.
//
//   Student = { student_number, first_name, last_name, status: "ACTIVE"|"INACTIVE"|"SUSPENDED"|"GRADUATED",
//               profile_photo_url|null, gender, date_of_birth, grade, subject_stream, school_name, district,
//               contact_number, whatsapp_number, email, guardian_name, guardian_contact,
//               classes: [{ id, title }]   // the teacher's classes this student is enrolled in
//             }
//
// To look at the page before the endpoint exists, set NEXT_PUBLIC_MOCK_TEACHER_STUDENTS=true in .env.local
// and restart `next dev`.
const USE_MOCK = process.env.NEXT_PUBLIC_MOCK_TEACHER_STUDENTS === 'true';

const MOCK = [
  { student_number: 'SYZ240101', first_name: 'Kavindu', last_name: 'Perera', status: 'ACTIVE', profile_photo_url: null, gender: 'Male', date_of_birth: '2008-03-14', grade: 'Grade 12', subject_stream: 'Physical Science', school_name: 'Ananda College', district: 'Colombo', contact_number: '0771234567', whatsapp_number: '0771234567', email: 'kavindu.perera@example.com', guardian_name: 'Nimal Perera', guardian_contact: '0712345678', classes: [{ id: 1, title: '2027 A/L Physics' }, { id: 2, title: '2027 A/L Physics Paper Class' }] },
  { student_number: 'SYZ240102', first_name: 'Nimali', last_name: 'Fernando', status: 'ACTIVE', profile_photo_url: null, gender: 'Female', date_of_birth: '2008-07-02', grade: 'Grade 12', subject_stream: 'Biological Science', school_name: 'Visakha Vidyalaya', district: 'Colombo', contact_number: '0719876543', whatsapp_number: '0759876543', email: 'nimali.f@example.com', guardian_name: 'Dilani Fernando', guardian_contact: '0764561230', classes: [{ id: 1, title: '2027 A/L Physics' }] },
  { student_number: 'SYZ240103', first_name: 'Tharindu Sachith', last_name: 'Silva', status: 'SUSPENDED', profile_photo_url: null, gender: 'Male', date_of_birth: '2007-11-23', grade: 'Grade 13', subject_stream: 'Physical Science', school_name: 'Royal College', district: 'Gampaha', contact_number: '0701112223', whatsapp_number: '', email: '', guardian_name: 'Kasun Silva', guardian_contact: '0777654321', classes: [{ id: 3, title: '2026 A/L Physics Revision' }] },
];

export async function getMyStudents() {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return MOCK.map((s) => ({ ...s, classes: s.classes.map((c) => ({ ...c })) }));
  }
  const list = await protectedRequestPath('/api/teacher-student/my-students', { method: 'GET' });
  if (!Array.isArray(list)) throw new Error('Unexpected response');
  return list;
}
