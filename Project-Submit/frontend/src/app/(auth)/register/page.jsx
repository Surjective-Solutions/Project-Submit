import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import AuthTabs from '@/components/auth/AuthTabs';
import StudentRegisterForm from '@/components/auth/StudentRegisterForm';

const LEFT_CONFIG = {
  headline: 'Join thousands of students already learning',
  bullets: [
    'Track your progress across all enrolled courses',
    'Get notified about upcoming classes and assignments',
    'Connect with instructors and peers seamlessly',
  ],
};

export const metadata = {
  title: 'Sign up — SubmitX',
};

export default function RegisterPage() {
  return (
    <AuthSplitLayout leftConfig={LEFT_CONFIG}>
      <AuthTabs active="register" />
      <StudentRegisterForm />
    </AuthSplitLayout>
  );
}
