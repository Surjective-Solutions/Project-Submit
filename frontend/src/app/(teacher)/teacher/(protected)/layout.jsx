'use client';

import { Suspense } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import TeacherSidebar from '@/components/teacher/TeacherSidebar';
import TeacherTopNav from '@/components/teacher/TeacherTopNav';
import AuthGuard from '@/components/AuthGuard';

export default function TeacherLayout({ children }) {
  return (
    <AuthGuard loginPath="/teacher/login" role="tutor">
      <div data-teacher-shell>
        <SidebarProvider defaultOpen={true}>
          <Suspense fallback={null}>
            <TeacherSidebar />
          </Suspense>
          <SidebarInset>
            <TeacherTopNav />
            <main className="flex-1 p-6 bg-[#F8FAFC] min-h-[calc(100vh-3.5rem)]">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </AuthGuard>
  );
}