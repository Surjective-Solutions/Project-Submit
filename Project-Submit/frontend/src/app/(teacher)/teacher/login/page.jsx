import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import TeacherLoginForm from '@/components/teacher/TeacherLoginForm';

const LEFT_CONFIG = {
  headline: 'Teach, track, and inspire your students',
  bullets: [
    'Manage your classes and student assignments',
    'Monitor student progress and performance',
    'Communicate with students and parents seamlessly',
  ],
};

export const metadata = {
  title: 'Teacher Login — SubmitX',
};

export default function TeacherLoginPage() {
  return (
    <AuthSplitLayout leftConfig={LEFT_CONFIG}>
      {/* Teacher portal badge */}
      <div className="mb-6 flex justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-medium text-indigo-700">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
          Teacher Portal
        </span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Teacher Login</h1>
      <p className="text-sm text-gray-500 mb-6">Sign in to your teacher dashboard</p>

      <TeacherLoginForm />
    </AuthSplitLayout>
  );
}
