import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import OtpVerifyForm from '@/components/auth/OtpVerifyForm';

const LEFT_CONFIG = {
  headline: 'One last step to get started',
  bullets: [
    'Your number is only used for account verification',
    'We will never share your contact details',
    'You can update your number anytime in settings',
  ],
};

export const metadata = {
  title: 'Verify your number — SubmitX',
};

export default function VerifyOtpPage() {
  return (
    <AuthSplitLayout leftConfig={LEFT_CONFIG}>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Verify your number</h1>
      <OtpVerifyForm role="student" />
    </AuthSplitLayout>
  );
}
