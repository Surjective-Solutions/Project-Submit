'use client';

import AdminSidebar from '@/components/admin/AdminSidebar';
import { AdminConsoleProvider } from '@/components/admin/AdminConsoleContext';
import AuthGuard from '@/components/AuthGuard';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import styles from '@/components/admin/admin-console.module.css';

export default function AdminLayout({ children }) {
  return (
    <AuthGuard loginPath="/admin/login">
      <AdminConsoleProvider>
        <SidebarProvider data-admin-shell defaultOpen className={styles.shell}>
          <AdminSidebar />
          <SidebarInset className={styles.content}>{children}</SidebarInset>
        </SidebarProvider>
      </AdminConsoleProvider>
    </AuthGuard>
  );
}