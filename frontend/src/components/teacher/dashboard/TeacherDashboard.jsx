'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { getTokenPayload } from '@/lib/auth';
import { getTutorById } from '@/lib/api-client';
import { getTeacherDashboard } from '@/teacher-dashboard/api';
import { firstNameOf, formatLongDate, greetingFor } from '@/teacher-dashboard/utils';
import SplitText from './SplitText';
import LeftColumn, { sectionHref } from './LeftColumn';
import RightColumn from './RightColumn';
import s from './dashboard.module.css';

const font = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap' });

// The teacher's home screen: today's sessions, the month's fees, their classes, and what's coming up.
// The numbers come from teacher-dashboard/api.js (sample data for now).
export default function TeacherDashboard() {
  const [state, setState] = useState({ status: 'loading', data: null });
  const [profileName, setProfileName] = useState('');
  const [nameReady, setNameReady] = useState(false); // the profile has answered (or given up), so the greeting is final

  const load = useCallback(() => {
    setState({ status: 'loading', data: null });
    let cancelled = false;
    getTeacherDashboard()
      .then((data) => !cancelled && setState({ status: 'ready', data }))
      .catch(() => !cancelled && setState({ status: 'error', data: null }));
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => load(), [load]);

  // The greeting uses the signed-in teacher's own name; the sample name is only a fallback.
  // The page waits for it (for at most 2.5 s) so the animated greeting plays once, with the right name.
  useEffect(() => {
    let cancelled = false;
    const giveUp = window.setTimeout(() => !cancelled && setNameReady(true), 2500);
    (async () => {
      try {
        const userSeq = getTokenPayload()?.userSeq;
        if (!userSeq) return;
        const tutor = await getTutorById(userSeq);
        if (!cancelled) setProfileName(firstNameOf(tutor?.displayName));
      } catch {
        // The sample name stays.
      } finally {
        if (!cancelled) setNameReady(true);
      }
    })();
    return () => {
      cancelled = true;
      window.clearTimeout(giveUp);
    };
  }, []);

  const { data } = state;
  const status = state.status === 'ready' && !nameReady ? 'loading' : state.status;
  const name = profileName || data?.teacher.firstName || '';
  const greeting = data ? `${greetingFor(data.asOf)}${name ? `, ${name}` : ''}` : '';

  return (
    <div className={`${s.page} ${font.className}`}>
      <div className={s.inner}>
        {status === 'loading' && (
          <div aria-busy="true" role="status" aria-label="Loading your dashboard" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className={s.skelHeader} />
            <div className={s.skelBody} />
          </div>
        )}

        {status === 'error' && (
          <div className={s.errorBox} role="alert">
            <AlertCircle size={20} aria-hidden="true" />
            <span className={s.errorText}>Couldn’t load your dashboard. Check the connection and try again.</span>
            <button type="button" className={s.btnSecondary} onClick={load}>
              <RefreshCw size={16} aria-hidden="true" />
              Try again
            </button>
          </div>
        )}

        {status === 'ready' && (
          <>
            <header className={s.header}>
              <div>
                <p className={s.date}>{formatLongDate(data.asOf)}</p>
                <h1 className={s.h1}>
                  <SplitText
                    key={greeting}
                    text={greeting}
                    effect="rise"
                    splitType="chars"
                    delay={50}
                    duration={1.25}
                    staggerFrom="start"
                    trigger="view"
                    hoverEffect="lift"
                    loop={false}
                    loopDelay={1.5}
                    mask={false}
                    threshold={0.1}
                    rootMargin="-100px"
                    textAlign="left"
                  />
                </h1>
              </div>
              <div className={s.actions}>
                <Link href={sectionHref('classes')} className={s.btnSecondary}>
                  Upload resource
                </Link>
                <Link href={sectionHref('classes')} className={s.btnSecondary}>
                  Add session
                </Link>
                <Link href={sectionHref('classes')} className={s.btnPrimary}>
                  New notice
                </Link>
              </div>
            </header>

            <div className={s.grid}>
              <LeftColumn data={data} />
              <RightColumn data={data} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
