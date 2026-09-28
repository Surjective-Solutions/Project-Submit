'use client';

import AdminSidebar from '@/components/admin/AdminSidebar';
import { AdminConsoleProvider } from '@/components/admin/AdminConsoleContext';
import AuthGuard from '@/components/AuthGuard';
import styles from '@/components/admin/admin-console.module.css';

export default function AdminLayout({ children }) {
  return (
    <AuthGuard loginPath="/admin/login">
      <AdminConsoleProvider>
        <div data-admin-shell className={styles.shell}>
          <AdminSidebar />
          <div className={styles.main}>
            <main className={styles.content}>{children}</main>
          </div>
        </div>
      </AdminConsoleProvider>
    </AuthGuard>
  );
}
