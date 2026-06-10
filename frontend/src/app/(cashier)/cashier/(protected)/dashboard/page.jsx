import PaymentsSection from '@/components/cashier/PaymentsSection';
import CashierStudentsSection from '@/components/cashier/CashierStudentsSection';
import CashierInstructorsSection from '@/components/cashier/CashierInstructorsSection';

export default async function CashierDashboardPage({ searchParams }) {
  const { section = 'payments' } = await searchParams;
  if (section === 'students') return <CashierStudentsSection />;
  if (section === 'instructors') return <CashierInstructorsSection />;
  return <PaymentsSection />;
}
