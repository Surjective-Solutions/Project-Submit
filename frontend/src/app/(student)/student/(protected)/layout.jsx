import { Suspense } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import StudentSidebar from '@/components/student/StudentSidebar';
import StudentTopNav from '@/components/student/StudentTopNav';

export default function StudentLayout({ children }) {
  return (
    <div data-student-shell>
      <SidebarProvider defaultOpen={true}>
        <Suspense fallback={null}>
          <StudentSidebar />
        </Suspense>
        <SidebarInset>
          <StudentTopNav />
          <main className="flex-1 p-6 bg-[#F8FAFC] min-h-[calc(100vh-3.5rem)]">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
