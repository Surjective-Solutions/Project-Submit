import { BarChart3 } from 'lucide-react';

export const metadata = {
  title: 'Dashboard — SubmitX Admin',
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ backgroundColor: '#EEF2FF' }}
      >
        <BarChart3 className="h-8 w-8" style={{ color: '#3940A0' }} />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard</h2>
      <p className="text-sm text-gray-400">
        Coming soon — your analytics will appear here.
      </p>
    </div>
  );
}
