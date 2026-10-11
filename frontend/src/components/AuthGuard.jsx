'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  isTokenExpired,
  markSessionExpired,
  markAccountDeactivated,
  getUserRole,
  TOKEN_REFRESH_MARGIN_SECONDS,
} from '@/lib/auth';
import { getSessionStatus, refreshSession, endServerSession } from '@/lib/api-client';

const SESSION_CHECK_INTERVAL_MS = 5000;
const DEACTIVATABLE_ROLES = ['tutor', 'instructor', 'cashier', 'student'];

export default function AuthGuard({ children, loginPath, role }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // A tab with no usable JWT (new tab, reload after expiry) can still be logged in through
    // the refresh cookie, so try that before sending the user to the login page.
    async function checkSession() {
      const hasValidToken = !!sessionStorage.getItem('token') && !isTokenExpired();
      const ok = hasValidToken || (await refreshSession(role));
      if (cancelled) return;
      if (ok) {
        setIsChecking(false);
      } else {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('role');
        router.replace(loginPath);
      }
    }

    checkSession();
    return () => {
      cancelled = true;
    };
  }, [router, loginPath, role]);

  // Catches tokens that expire, or accounts that get deactivated, while the user stays on the page.
  useEffect(() => {
    if (isChecking) return;

    const intervalId = setInterval(async () => {
      // Renew the JWT shortly before it expires. Only log out once it has really expired and the
      // refresh cookie can't renew it, so a network blip during the early window is retried.
      if (isTokenExpired(TOKEN_REFRESH_MARGIN_SECONDS)) {
        const refreshed = await refreshSession(getUserRole() ?? role);
        if (!refreshed && isTokenExpired()) {
          endServerSession(role);
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('role');
          markSessionExpired();
          router.replace(loginPath);
          return;
        }
      }

      if (DEACTIVATABLE_ROLES.includes(getUserRole())) {
        try {
          const { active } = await getSessionStatus();
          if (active === false) {
            // the cookie is still in this browser, so the server can revoke its row too
            endServerSession(role);
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
  }, [isChecking, router, loginPath, role]);

  if (isChecking) return null;

  return <>{children}</>;
}