import ClassesSection from '@/components/teacher/ClassesSection';
import InstructorsSection from '@/components/teacher/InstructorsSection';
import StatisticsSection from '@/components/teacher/StatisticsSection';
import AccountSection from '@/components/teacher/AccountSection';

export default async function TeacherDashboardPage({ searchParams }) {
  const { section = 'classes' } = await searchParams;

  if (section === 'instructors') return <InstructorsSection />;
  if (section === 'statistics') return <StatisticsSection />;
  if (section === 'account') return <AccountSection />;
  return <ClassesSection />;
}
