import TeacherDashboard from '@/components/teacher/dashboard/TeacherDashboard';
import TeacherClassesPage from '@/components/admin/classes/TeacherClassesPage';
import StudentsSection from '@/components/teacher/StudentsSection';
import TeacherAttendancePage from '@/components/teacher/TeacherAttendancePage';
import TeacherStudyPacksPage from '@/components/teacher/TeacherStudyPacksPage';
import ExamsSection from '@/components/teacher/ExamsSection';
import InstructorsSection from '@/components/teacher/InstructorsSection';
import StatisticsSection from '@/components/teacher/StatisticsSection';
import AccountSection from '@/components/teacher/AccountSection';

// Sections are picked with ?section=. "dashboard" (the default) is the teacher's home screen. "classes" is the teacher's own classes (created by the admin; the teacher runs
// their sessions). "exams" is the section that used to be called classes: the exam classes, their papers and
// submissions. "students" and "attendance" cover the students enrolled in the teacher's own classes. "study-packs" is the teacher's
// own study packs, built from their own recordings.
export default async function TeacherDashboardPage({ searchParams }) {
  const { section = 'dashboard' } = await searchParams;

  if (section === 'classes') return <TeacherClassesPage />;
  if (section === 'students') return <StudentsSection />;
  if (section === 'attendance') return <TeacherAttendancePage />;
  if (section === 'study-packs') return <TeacherStudyPacksPage />;
  if (section === 'exams') return <ExamsSection />;
  if (section === 'instructors') return <InstructorsSection />;
  if (section === 'statistics') return <StatisticsSection />;
  if (section === 'account') return <AccountSection />;
  return <TeacherDashboard />;
}
