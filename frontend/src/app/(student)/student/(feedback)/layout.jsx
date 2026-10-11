'use client';
import AuthGuard from '@/components/AuthGuard';
import { EnrolledClassesProvider } from '@/context/EnrolledClassesContext';

export default function FeedbackRouteLayout({ children }) {
  return (
    <AuthGuard loginPath="/login" role="student">
      <EnrolledClassesProvider>
        <div className="min-h-screen bg-[#F8FAFC]">
          {children}
        </div>
      </EnrolledClassesProvider>
    </AuthGuard>
  );
}