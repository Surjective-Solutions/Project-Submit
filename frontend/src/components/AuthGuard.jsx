'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isTokenExpired, markSessionExpired, markAccountDeactivated, getUserRole } from '@/lib/auth';
import { getSessionStatus } from '@/lib/api-client';

const SESSION_CHECK_INTERVAL_MS = 5000;
const DEACTIVATABLE_ROLES = ['tutor', 'instructor', 'cashier'];

export default function AuthGuard({ children, loginPath }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token || isTokenExpired()) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('role');
      router.replace(loginPath);
    } else {
      setIsChecking(false);
    }
  }, [router, loginPath]);

  // Catches tokens that expire, or accounts that get deactivated, while the user stays on the page.
  useEffect(() => {
    if (isChecking) return;

    const intervalId = setInterval(async () => {
      if (isTokenExpired()) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('role');
        markSessionExpired();
        router.replace(loginPath);
        return;
      }

      if (DEACTIVATABLE_ROLES.includes(getUserRole())) {
        try {
          const { active } = await getSessionStatus();
          if (active === false) {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('role');
            markAccountDeactivated();
            router.replace(loginPath);
          }
        } catch {
          // transient network/server error — don't log the user out over a blip
        }
      }
    }, SESSION_CHECK_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [isChecking, router, loginPath]);

  if (isChecking) return null;

  return <>{children}</>;
}