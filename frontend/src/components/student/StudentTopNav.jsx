'use client';

import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function StudentTopNav() {
  const pathname = usePathname();
  const title = pathname.startsWith('/student') ? 'Dashboard' : 'Student';
  
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-white px-4">
      <SidebarTrigger className="-ml-1 text-gray-400 hover:text-gray-700" />
      <Separator orientation="vertical" className="h-4 bg-gray-200" />

      <div className="flex-1">
        <h1 className="text-sm font-semibold text-gray-900">Dashboard</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="h-8 w-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100 relative"
        >
          <Bell className="h-[17px] w-[17px]" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
        </Button>

        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white cursor-pointer shrink-0"
          style={{ background: 'linear-gradient(135deg, #3940A0 0%, #5a62ff 100%)' }}
          aria-label="Student menu"
        >
          S
        </div>
      </div>
    </header>
  );
}
