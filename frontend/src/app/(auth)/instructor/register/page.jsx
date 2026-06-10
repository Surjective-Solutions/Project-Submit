import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import InstructorRegisterForm from '@/components/auth/InstructorRegisterForm';

const LEFT_CONFIG = {
  headline: 'Share your knowledge, grow your impact',
  bullets: [
    'Build and publish courses to hundreds of students',
    'Set your own schedule and manage your availability',
    'Get paid seamlessly with integrated billing tools',
  ],
};

export const metadata = {
  title: 'Apply as Instructor — SubmitX',
};

export default function InstructorRegisterPage() {
  return (
    <AuthSplitLayout leftConfig={LEFT_CONFIG}>
      {/* Instructor portal badge */}
      <div className="mb-6 flex justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-medium text-amber-700">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
          Instructor Portal
        </span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Apply as an Instructor</h1>
      <p className="text-sm text-gray-500 mb-6">
        Your application will be reviewed before activation.
      </p>

      <InstructorRegisterForm />
    </AuthSplitLayout>
  );
}
