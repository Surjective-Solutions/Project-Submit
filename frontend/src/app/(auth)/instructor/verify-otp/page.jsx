import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import OtpVerifyForm from '@/components/auth/OtpVerifyForm';

const LEFT_CONFIG = {
  headline: 'Confirm your instructor account',
  bullets: [
    'Verification protects your instructor profile',
    'Your contact details stay private and secure',
    'You can continue setup after confirmation',
  ],
};

export const metadata = {
  title: 'Verify instructor OTP — SubmitX',
};

export default function InstructorVerifyOtpPage() {
  return (
    <AuthSplitLayout leftConfig={LEFT_CONFIG}>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Verify your number</h1>
      <OtpVerifyForm role="instructor" />
    </AuthSplitLayout>
  );
}
