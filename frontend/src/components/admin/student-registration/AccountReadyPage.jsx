'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/components/admin/Icon';
import { REGISTER_ROUTE } from '@/student-registration/routes';
import { studentHref } from '@/student-registration/utils';
import Avatar from './Avatar';
import { useRegistrationFlow } from './RegistrationFlowContext';
import StepIndicator from './StepIndicator';
import styles from './registration.module.css';
import flow from './flow.module.css';

export default function AccountReadyPage() {
  const router = useRouter();
  const { result, clear } = useRegistrationFlow();
  const headingRef = useRef(null);
  const leaving = useRef(false);

  // Opening this page directly (or after a refresh) has nothing to show: go back to page 1.
  useEffect(() => {
    if (!result && !leaving.current) router.replace(REGISTER_ROUTE);
  }, [result, router]);

  useEffect(() => {
    if (result) {
      window.scrollTo?.({ top: 0 });
      headingRef.current?.focus({ preventScroll: true });
    }
  }, [result]);

  if (!result) return null;
  const { summary, photoUrl, studentId } = result;

  function registerAnother() {
    leaving.current = true;
    clear();
    router.push(REGISTER_ROUTE);
  }

  return (
    <div className={styles.page}>
      <div className={styles.titleRow}>
        <div>
          <h1 className={styles.h1}>Account Ready</h1>
          <p className={styles.subtitle}>The student account has been created.</p>
        </div>
      </div>

      <StepIndicator step={3} />

      <section className={`${styles.card} ${styles.success} ${flow.ready}`} aria-labelledby="account-ready-title">
        <div className={styles.successAvatar}>
          <Avatar photo={photoUrl} initials={summary.initials} size={84} className={flow.readyAvatar} />
          <span className={styles.successBadge} aria-hidden="true">
            <Icon name="check" size={16} weight={700} />
          </span>
        </div>

        <div className={styles.successText}>
          <h2 id="account-ready-title" ref={headingRef} tabIndex={-1} className={styles.successTitle}>
            {summary.name} is registered
          </h2>
          <p className={styles.successSub}>
            Account created. The student signs in with {summary.phone} and the password you set.
          </p>
        </div>

        <dl className={flow.readyBox}>
          {summary.rows.map(([label, value]) => (
            <div key={label} className={flow.readyCell}>
              <dt>{label}</dt>
              <dd className={label === 'Student ID' ? styles.mono : undefined}>{value}</dd>
            </div>
          ))}
        </dl>

        <div className={styles.successActions}>
          <Link href={studentHref(studentId)} className={styles.secondaryButton}>
            <Icon name="person" size={19} />
            View student
          </Link>
          <button type="button" className={styles.primaryButton} onClick={registerAnother}>
            <Icon name="person_add" size={20} weight={600} />
            Register another
          </button>
        </div>
      </section>
    </div>
  );
}
