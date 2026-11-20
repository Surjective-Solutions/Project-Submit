import TeacherDashboard from '@/components/teacher/dashboard/TeacherDashboard';
import TeacherClassesPage from '@/components/admin/classes/TeacherClassesPage';
import StudentsSection from '@/components/teacher/StudentsSection';
import TeacherAttendancePage from '@/components/teacher/TeacherAttendancePage';
import TeacherStudyPacksPage from '@/components/teacher/TeacherStudyPacksPage';
import TeacherClassRecordingsPage from '@/components/teacher/TeacherClassRecordingsPage';
import ExamsSection from '@/components/teacher/ExamsSection';
import InstructorsSection from '@/components/teacher/InstructorsSection';
import StatisticsSection from '@/components/teacher/StatisticsSection';
import TeacherReportsPage from '@/components/teacher/reports/TeacherReportsPage';
import AccountSection from '@/components/teacher/AccountSection';

// Sections are picked with ?section=. "dashboard" (the default) is the teacher's home screen. "classes" is the teacher's own classes (created by the admin; the teacher runs
// their sessions). "exams" is the section that used to be called classes: the exam classes, their papers and
// submissions. "students" and "attendance" cover the students enrolled in the teacher's own classes. "study-packs" is the teacher's
// own study packs, built from their own recordings. "class-recordings" is the teacher's own recordings, which they upload into
// the folders the admin created. "reports" are downloadable reports (CSV or PDF) on the teacher's own
// classes, admissions and study packs.
export default async function TeacherDashboardPage({ searchParams }) {
  const { section = 'dashboard' } = await searchParams;

  if (section === 'classes') return <TeacherClassesPage />;
  if (section === 'students') return <StudentsSection />;
  if (section === 'attendance') return <TeacherAttendancePage />;
  if (section === 'study-packs') return <TeacherStudyPacksPage />;
  if (section === 'class-recordings') return <TeacherClassRecordingsPage />;
  if (section === 'exams') return <ExamsSection />;
  if (section === 'instructors') return <InstructorsSection />;
  if (section === 'statistics') return <StatisticsSection />;
  if (section === 'reports') return <TeacherReportsPage />;
  if (section === 'account') return <AccountSection />;
  return <TeacherDashboard />;
}
