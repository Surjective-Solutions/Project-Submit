'use client';

import { Suspense } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import CashierSidebar from '@/components/cashier/CashierSidebar';
import CashierTopNav from '@/components/cashier/CashierTopNav';
import AuthGuard from '@/components/AuthGuard';

export default function CashierLayout({ children }) {
  return (
    <AuthGuard loginPath="/cashier/login" role="cashier">
      <div data-cashier-shell>
        <SidebarProvider defaultOpen={true}>
          <Suspense fallback={null}>
            <CashierSidebar />
          </Suspense>
          <SidebarInset>
            <CashierTopNav />
            <main className="flex-1 p-6 bg-[#F8FAFC] min-h-[calc(100vh-3.5rem)]">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </AuthGuard>
  );
}