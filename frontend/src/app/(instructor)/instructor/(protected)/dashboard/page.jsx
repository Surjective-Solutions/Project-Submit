import TeachersSection from '@/components/instructor/TeachersSection';
import AccountSection from '@/components/instructor/AccountSection';
import ComingSoonSection from '@/components/student/ComingSoonSection';

export const metadata = {
  title: 'Instructor Dashboard — SubmitX',
};

export default async function InstructorDashboardPage({ searchParams }) {
  const { section = 'teachers' } = await searchParams;

  if (section === 'account')  return <AccountSection />;
  if (section === 'calendar') return <ComingSoonSection section="calendar" />;
  if (section === 'help')     return <ComingSoonSection section="help" />;
  return <TeachersSection />;
}
