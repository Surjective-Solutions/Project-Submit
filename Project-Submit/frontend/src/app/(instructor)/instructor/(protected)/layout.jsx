import { Suspense } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import InstructorSidebar from '@/components/instructor/InstructorSidebar';
import InstructorTopNav from '@/components/instructor/InstructorTopNav';

export default function InstructorLayout({ children }) {
  return (
    <div data-instructor-shell>
      <SidebarProvider defaultOpen={true}>
        <Suspense fallback={null}>
          <InstructorSidebar />
        </Suspense>
        <SidebarInset>
          <InstructorTopNav />
          <main className="flex-1 p-6 bg-[#F8FAFC] min-h-[calc(100vh-3.5rem)]">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
