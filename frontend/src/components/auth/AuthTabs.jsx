'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Pill-style tab switcher between Login and Register.
 * Uses <Link> so the active state is driven by the current route.
 */
export default function AuthTabs({ active }) {
  return (
    <div
      className="inline-flex items-center rounded-full p-1 gap-0.5 mb-7"
      style={{ backgroundColor: '#f1f5f9' }}
      role="tablist"
      aria-label="Authentication options"
    >
      <Link
        href="/login"
        role="tab"
        aria-selected={active === 'login'}
        className={cn(
          'rounded-full px-5 py-1.5 text-sm font-medium transition-all',
          active === 'login'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        )}
      >
        Log in
      </Link>
      <Link
        href="/register"
        role="tab"
        aria-selected={active === 'register'}
        className={cn(
          'rounded-full px-5 py-1.5 text-sm font-medium transition-all',
          active === 'register'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        )}
      >
        Sign up
      </Link>
    </div>
  );
}
