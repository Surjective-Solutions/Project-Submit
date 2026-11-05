'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/admin/Icon';
import { students, uploads } from '@/student-registration/api';
import {
  mismatchShown,
  passwordRules,
  passwordStrength,
  passwordsMatch,
  unmetCount,
} from '@/student-registration/password';
import { READY_ROUTE, REGISTER_ROUTE } from '@/student-registration/routes';
import { buildSummary } from '@/student-registration/summary';
import { buildPayload } from '@/student-registration/utils';
import PasswordInput from './PasswordInput';
import PasswordRules from './PasswordRules';
import PasswordSummary from './PasswordSummary';
import { useRegistrationFlow } from './RegistrationFlowContext';
import StepIndicator from './StepIndicator';
import StrengthMeter from './StrengthMeter';
import styles from './registration.module.css';
import flow from './flow.module.css';

export default function SetPasswordPage() {
  const router = useRouter();
  const { pending, setPending, setResult } = useRegistrationFlow();
  const finished = useRef(false); // set once the account is created, so the guard below does not redirect

  // The password only ever lives in these two states. It is not stored, logged or put in a URL.
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Opening this page directly (or after a refresh) has no student to work on: go back to page 1.
  useEffect(() => {
    if (!pending && !finished.current) router.replace(REGISTER_ROUTE);
  }, [pending, router]);

  const summary = useMemo(() => (pending ? buildSummary(pending.form, pending.studentId) : null), [pending]);
  const rules = useMemo(
    () =>
      passwordRules(password, {
        firstName: summary?.firstName ?? '',
        lastName: summary?.lastName ?? '',
        contactDigits: summary?.contactDigits ?? '',
      }),
    [password, summary]
  );

  if (!pending || !summary) return null;

  const strength = passwordStrength(password, rules);
  const unmet = unmetCount(rules);
  const showMismatch = mismatchShown(password, confirm, submitted);
  const matches = passwordsMatch(password, confirm);

  const rulesBroken = submitted && unmet > 0;
  let banner = '';
  if (rulesBroken) banner = `${unmet} password ${unmet === 1 ? 'requirement is' : 'requirements are'} not met yet.`;
  else if (submitted && showMismatch) banner = "The two passwords don't match.";

  function focus(id) {
    const el = document.getElementById(id);
    el?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
    el?.focus({ preventScroll: true });
  }

  function goBack() {
    router.push(REGISTER_ROUTE); // the form on page 1 is still filled in (it is kept in the flow context)
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setSubmitted(true);
    setServerError('');

    if (unmet > 0) {
      focus('reg-password');
      return;
    }
    if (password !== confirm) {
      focus('reg-confirmPassword');
      return;
    }

    setSubmitting(true);
    try {
      const payload = { ...buildPayload(pending.form, { sameWhatsapp: pending.sameWhatsapp }), password };
      if (pending.photo?.file) payload.photo = await uploads.profilePhoto(pending.photo.file);
      const { studentId } = await students.register(payload);

      finished.current = true;
      setResult({
        studentId,
        summary: buildSummary(pending.form, studentId),
        photoUrl: pending.photo?.dataUrl || '',
      });
      setPassword('');
      setConfirm('');
      setPending(null); // the registration data is cleared once the account exists
      router.push(READY_ROUTE);
    } catch (err) {
      setServerError(err?.message || 'Could not create the account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.titleRow}>
        <div>
          <h1 className={styles.h1}>Set Password</h1>
          <p className={styles.subtitle}>Create the sign-in password for the new student account.</p>
        </div>
      </div>

      <StepIndicator step={2} />

      <div className={styles.layout}>
        <form className={styles.formCol} onSubmit={handleSubmit} noValidate aria-label="Set account password">
          <section className={styles.card} aria-labelledby="password-card-title">
            <header className={styles.cardHeader}>
              <span className={styles.cardIcon} aria-hidden="true">
                <Icon name="lock" size={19} />
              </span>
              <div className={styles.cardTitles}>
                <h2 id="password-card-title" className={styles.cardTitle}>
                  Set account password
                </h2>
                <p className={styles.cardSub}>The student signs in with {summary.phone} and this password.</p>
              </div>
              <span className={styles.tagRequired}>Required</span>
            </header>

            {(banner || serverError) && (
              <div className={styles.errorBox} role="alert">
                {serverError || banner}
              </div>
            )}

            <div className={flow.pwGrid}>
              <div className={flow.pwColumn}>
                <PasswordInput
                  id="reg-password"
                  label="Enter password"
                  value={password}
                  onChange={setPassword}
                  state={rulesBroken ? 'error' : undefined}
                  describedBy="reg-password-strength reg-password-rules"
                />
                <StrengthMeter id="reg-password-strength" strength={strength} />
              </div>

              <div className={flow.pwColumn}>
                <PasswordInput
                  id="reg-confirmPassword"
                  label="Confirm password"
                  value={confirm}
                  onChange={setConfirm}
                  state={showMismatch ? 'error' : matches ? 'ok' : undefined}
                  describedBy="reg-confirm-message"
                />
                <div id="reg-confirm-message" aria-live="polite" className={flow.confirmMessage}>
                  {showMismatch && <p className={styles.error}>Passwords don&apos;t match</p>}
                  {!showMismatch && matches && (
                    <p className={flow.matchOk}>
                      <Icon name="check" size={16} weight={700} />
                      Passwords match
                    </p>
                  )}
                </div>
              </div>
            </div>

            <PasswordRules id="reg-password-rules" rules={rules} submitted={submitted} />

            <div className={flow.formFooter}>
              <button type="button" className={styles.secondaryButton} onClick={goBack} disabled={submitting}>
                <Icon name="arrow_back" size={18} />
                Back to details
              </button>
              <button type="submit" className={styles.primaryButton} disabled={submitting} aria-busy={submitting || undefined}>
                <span className={submitting ? styles.spin : styles.iconSlot}>
                  <Icon name={submitting ? 'progress_activity' : 'how_to_reg'} size={21} weight={600} />
                </span>
                {submitting ? 'Registering…' : 'Register student'}
              </button>
            </div>
          </section>
        </form>

        <PasswordSummary summary={summary} photoUrl={pending.photo?.dataUrl || ''} onEdit={goBack} />
      </div>
    </div>
  );
}
