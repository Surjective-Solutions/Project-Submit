"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useOptionalPageTransition } from "./PageTransition";

const MAX_WAIT_MS = 4000;
const POLL_MS = 25;

// Resolves once the address bar shows `path` (Next updates it when the new page is committed).
// It polls instead of watching usePathname, because the component that started the
// navigation is usually unmounted by then.
function urlReached(path) {
  return new Promise((resolve) => {
    const started = Date.now();
    const check = () => {
      if (window.location.pathname === path || Date.now() - started > MAX_WAIT_MS) resolve();
      else setTimeout(check, POLL_MS);
    };
    check();
  });
}

/**
 * Next.js version of the navigate helper.
 *
 *   const go = useTransitionNavigate();
 *   go("/admin/class-recordings/tutors/1");
 *
 * The screen stays covered until the URL has actually changed, so the reveal never
 * plays over the old page. Without a <PageTransitionProvider> it is a plain router.push.
 */
export function useTransitionNavigate() {
  const router = useRouter();
  const ctx = useOptionalPageTransition();
  const transition = ctx?.transition;

  return useCallback(
    (href, transitionOptions) => {
      if (!transition) {
        router.push(href);
        return Promise.resolve();
      }
      return transition(() => {
        router.push(href);
        return urlReached(href.split(/[?#]/)[0]);
      }, transitionOptions);
    },
    [router, transition]
  );
}
