import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import AdminLoginForm from '@/components/admin/AdminLoginForm';

const LEFT_CONFIG = {
  headline: 'Manage your institution from one place',
  bullets: [
    'Oversee students, instructors, and cashiers',
    'Monitor payments and course enrollments',
    'Full visibility across your entire platform',
  ],
};

export const metadata = {
  title: 'Admin Login — SubmitX',
};

export default function AdminLoginPage() {
  return (
    <AuthSplitLayout leftConfig={LEFT_CONFIG}>
      {/* Admin portal badge */}
      <div className="mb-6 flex justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-medium text-rose-700">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
          Admin Portal
        </span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Login</h1>
      <p className="text-sm text-gray-500 mb-6">Sign in to your admin dashboard</p>

      <AdminLoginForm />
    </AuthSplitLayout>
  );
}
