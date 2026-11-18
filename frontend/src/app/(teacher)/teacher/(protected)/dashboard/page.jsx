import TeacherClassesPage from '@/components/admin/classes/TeacherClassesPage';
import ExamsSection from '@/components/teacher/ExamsSection';
import InstructorsSection from '@/components/teacher/InstructorsSection';
import StatisticsSection from '@/components/teacher/StatisticsSection';
import AccountSection from '@/components/teacher/AccountSection';

// Sections are picked with ?section=. "classes" is the teacher's own classes (created by the admin; the teacher runs
// their sessions). "exams" is the section that used to be called classes: the exam classes, their papers and
// submissions.
export default async function TeacherDashboardPage({ searchParams }) {
  const { section = 'classes' } = await searchParams;

  if (section === 'exams') return <ExamsSection />;
  if (section === 'instructors') return <InstructorsSection />;
  if (section === 'statistics') return <StatisticsSection />;
  if (section === 'account') return <AccountSection />;
  return <TeacherClassesPage />;
}
