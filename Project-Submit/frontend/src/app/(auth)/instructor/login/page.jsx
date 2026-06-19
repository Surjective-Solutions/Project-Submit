import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import InstructorLoginForm from '@/components/auth/InstructorLoginForm';

const LEFT_CONFIG = {
  headline: 'Empower your students with better tools',
  bullets: [
    'Build and manage courses with an intuitive editor',
    'Track student progress and performance in real time',
    'Schedule classes and manage assignments effortlessly',
  ],
};

export const metadata = {
  title: 'Instructor Login — SubmitX',
};

export default function InstructorLoginPage() {
  return (
    <AuthSplitLayout leftConfig={LEFT_CONFIG}>
      {/* Instructor portal badge */}
      <div className="mb-6 flex justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-medium text-amber-700">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
          Instructor Portal
        </span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Instructor Login</h1>
      <p className="text-sm text-gray-500 mb-6">Access your instructor dashboard</p>

      <InstructorLoginForm />
    </AuthSplitLayout>
  );
}
