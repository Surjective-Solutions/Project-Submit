import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import AuthTabs from '@/components/auth/AuthTabs';
import StudentLoginForm from '@/components/auth/StudentLoginForm';

const LEFT_CONFIG = {
  headline: 'The complete learning management platform',
  bullets: [
    'Manage courses, students, and grading in one place',
    'Built for tuition institutes and educational institutions',
    'Secure multi-institution platform with role-based access',
  ],
};

export const metadata = {
  title: 'Log in — SubmitX',
};

export default function LoginPage() {
  return (
    <AuthSplitLayout leftConfig={LEFT_CONFIG}>
      <AuthTabs active="login" />
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
      <p className="text-sm text-gray-500 mb-6">Log in to your SubmitX account</p>
      <StudentLoginForm />
    </AuthSplitLayout>
  );
}
