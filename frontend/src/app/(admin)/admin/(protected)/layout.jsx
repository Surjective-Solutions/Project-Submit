import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopNav from '@/components/admin/AdminTopNav';

export default function AdminLayout({ children }) {
  return (
    <div data-admin-shell>
      <SidebarProvider defaultOpen={true}>
        <AdminSidebar />
        <SidebarInset>
          <AdminTopNav />
          <main className="flex-1 p-6 bg-[#F8FAFC] min-h-[calc(100vh-3.5rem)]">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
