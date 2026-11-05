import { RegistrationFlowProvider } from '@/components/admin/student-registration/RegistrationFlowContext';

// Wraps the three registration pages so the student's details stay in memory while the admin moves
// between them. Leaving the section discards them.
export default function StudentRegistrationLayout({ children }) {
  return <RegistrationFlowProvider>{children}</RegistrationFlowProvider>;
}
