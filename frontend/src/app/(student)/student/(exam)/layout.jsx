'use client';

import AuthGuard from '@/components/AuthGuard';
import { EnrolledClassesProvider } from '@/context/EnrolledClassesContext';

// Sibling route group to (protected) that intentionally has no sidebar/top
// nav — the exam flow must render as a standalone, distraction-free screen
// with no dashboard chrome or navigation links.
export default function ExamRouteLayout({ children }) {
  return (
    <AuthGuard loginPath="/login" role="student">
      <EnrolledClassesProvider>
        <div className="min-h-screen bg-[#F8FAFC] p-6">
          {children}
        </div>
      </EnrolledClassesProvider>
    </AuthGuard>
  );
}
