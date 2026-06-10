import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import CashierLoginForm from '@/components/cashier/CashierLoginForm';

const LEFT_CONFIG = {
  headline: 'Manage payments and collections efficiently',
  bullets: [
    'Process student fee payments quickly and accurately',
    'Track daily collections and generate receipts',
    'Real-time payment status and transaction history',
  ],
};

export const metadata = {
  title: 'Cashier Login — SubmitX',
};

export default function CashierLoginPage() {
  return (
    <AuthSplitLayout leftConfig={LEFT_CONFIG}>
      {/* Cashier portal badge */}
      <div className="mb-6 flex justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-medium text-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          Cashier Portal
        </span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Cashier Login</h1>
      <p className="text-sm text-gray-500 mb-6">Sign in to your cashier dashboard</p>

      <CashierLoginForm />
    </AuthSplitLayout>
  );
}
