import MyClassesSection from '@/components/student/MyClassesSection';
import AccountSection from '@/components/student/AccountSection';
import TeachersSection from '@/components/student/TeachersSection';
import ComingSoonSection from '@/components/student/ComingSoonSection';

export default async function StudentDashboardPage({ searchParams }) {
  const { section = 'classes' } = await searchParams;
  if (section === 'account')    return <AccountSection />;
  if (section === 'teachers')   return <TeachersSection />;
  if (section === 'statistics') return <ComingSoonSection section="statistics" />;
  if (section === 'calendar')   return <ComingSoonSection section="calendar" />;
  if (section === 'help')       return <ComingSoonSection section="help" />;
  return <MyClassesSection />;
}
