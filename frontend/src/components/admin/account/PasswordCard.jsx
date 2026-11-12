'use client';

import { useMemo, useState } from 'react';
import Icon from '@/components/admin/Icon';
import { changeAdminPassword, logoutSession } from '@/lib/api-client';
import { splitName, errorMessage } from '@/admin-account/utils';
import {
  mismatchShown,
  passwordRules,
  passwordStrength,
  passwordsMatch,
  unmetCount,
} from '@/student-registration/password';
import styles from './account.module.css';

// How long the "password changed" message stays before the admin is sent to the login page.
const SIGN_OUT_DELAY_MS = 1800;

// Same eight rules as a new student's password (the server enforces them too); only the wording of the
// personal-information rule changes, because this is the admin's own name and number.
const PERSONAL_LABEL = 'No name or phone number';

export default function PasswordCard({ profile }) {
  // The passwords only ever live in these states. They are not stored, logged or put in a URL.
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const [currentError, setCurrentError] = useState('');

  const { firstName, lastName } = splitName(profile.fullName);
  const rules = useMemo(
    () =>
      passwordRules(password, { firstName, lastName, contactDigits: profile.phone || '' }).map((rule) =>
        rule.id === 'personal' ? { ...rule, label: PERSONAL_LABEL } : rule
      ),
    [password, firstName, lastName, profile.phone]
  );

  const strength = passwordStrength(password, rules);
  const unmet = unmetCount(rules);
  const showMismatch = mismatchShown(password, confirm, submitted);
  const matches = passwordsMatch(password, confirm);
  const sameAsCurrent = submitted && !!password && password === current;
  const rulesBroken = submitted && unmet > 0;
  const currentMissing = submitted && !current;

  function focus(id) {
    const el = document.getElementById(id);
    el?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
    el?.focus({ preventScroll: true });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;
    setSubmitted(true);
    setServerError('');
    setCurrentError('');

    if (!current) return focus('acc-current');
    if (unmet > 0) return focus('acc-new');
    if (password === current) return focus('acc-new');
    if (password !== confirm) return focus('acc-confirm');

    setSaving(true);
    try {
      const res = await changeAdminPassword({ currentPassword: current, newPassword: password });
      if (!res?.isSuccess) {
        if (res?.field === 'currentPassword') {
          setCurrentError(res.message || 'Your current password is incorrect.');
          focus('acc-current');
        } else {
          setServerError(res?.message || 'Could not change your password. Please try again.');
        }
        return;
      }
      setCurrent('');
      setPassword('');
      setConfirm('');
      setSubmitted(false);

      // The server ends every login session of this admin when the password changes, this one included,
      // so sign out here too and send them to the login page to use the new password.
      setSigningOut(true);
      setTimeout(async () => {
        await logoutSession('admin');
        window.location.href = '/admin/login';
      }, SIGN_OUT_DELAY_MS);
    } catch (error) {
      setServerError(errorMessage(error, 'Couldn’t reach the server. Check the connection and try again.'));
    } finally {
      setSaving(false);
    }
  }

  let banner = '';
  if (serverError) banner = serverError;
  else if (rulesBroken) banner = `${unmet} password ${unmet === 1 ? 'requirement is' : 'requirements are'} not met yet.`;
  else if (sameAsCurrent) banner = 'Choose a password that is different from your current one.';
  else if (submitted && showMismatch) banner = 'The two new passwords don’t match.';

  return (
    <form className={styles.card} onSubmit={handleSubmit} noValidate aria-labelledby="acc-password-title">
      <header className={styles.cardHeader}>
        <span className={styles.cardIcon} aria-hidden="true">
          <Icon name="lock" size={19} />
        </span>
        <div className={styles.cardTitles}>
          <h2 id="acc-password-title" className={styles.cardTitle}>
            Change password
          </h2>
          <p className={styles.cardSub}>Enter your current password, then choose a new one.</p>
        </div>
      </header>

      {signingOut && (
        <div className={styles.successBox} role="status">
          <Icon name="check_circle" size={20} weight={600} fill={1} />
          <span className={styles.errorText}>Password changed. Signing you out so you can sign in with the new one…</span>
        </div>
      )}

      {banner && (
        <div className={styles.errorBox} role="alert">
          <Icon name="error" size={20} weight={600} fill={1} />
          <span className={styles.errorText}>{banner}</span>
        </div>
      )}

      <PasswordField
        id="acc-current"
        label="Current password"
        value={current}
        onChange={(value) => {
          setCurrent(value);
          setCurrentError('');
        }}
        autoComplete="current-password"
        error={currentError || (currentMissing ? 'Enter your current password.' : '')}
      />

      <div className={styles.pwBlock}>
        <PasswordField
          id="acc-new"
          label="New password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          state={rulesBroken || sameAsCurrent ? 'error' : undefined}
          describedBy="acc-new-strength acc-new-rules"
        />
        <div id="acc-new-strength" className={styles.meter}>
          <div className={styles.meterBars} aria-hidden="true">
            {[1, 2, 3, 4].map((segment) => (
              <span
                key={segment}
                className={styles.meterBar}
                style={segment <= strength.level ? { background: strength.color } : undefined}
              />
            ))}
          </div>
          <span
            className={styles.meterLabel}
            style={strength.level ? { color: strength.level === 2 ? '#7a6a00' : strength.color } : undefined}
          >
            <span className={styles.srOnly}>Password strength: </span>
            {strength.label}
          </span>
        </div>
      </div>

      <div className={styles.pwBlock}>
        <PasswordField
          id="acc-confirm"
          label="Confirm new password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
          state={showMismatch ? 'error' : matches ? 'ok' : undefined}
          describedBy="acc-confirm-message"
        />
        <div id="acc-confirm-message" aria-live="polite" className={styles.confirmMessage}>
          {showMismatch && <p className={styles.error}>Passwords don&rsquo;t match</p>}
          {!showMismatch && matches && (
            <p className={styles.matchOk}>
              <Icon name="check" size={16} weight={700} />
              Passwords match
            </p>
          )}
        </div>
      </div>

      <div className={styles.rulesBox}>
        <p id="acc-new-rules-title" className={styles.rulesTitle}>
          New password must have
        </p>
        <ul id="acc-new-rules" className={styles.rulesList} aria-labelledby="acc-new-rules-title">
          {rules.map((rule) => {
            const failed = submitted && !rule.met;
            const stateClass = rule.met ? styles.ruleMet : failed ? styles.ruleFailed : '';
            return (
              <li key={rule.id} className={`${styles.rule} ${stateClass}`} data-rule={rule.id} data-met={rule.met}>
                <span className={styles.ruleDot} aria-hidden="true">
                  {rule.met ? <Icon name="check" size={14} weight={700} /> : failed ? <Icon name="close" size={14} weight={700} /> : null}
                </span>
                <span>
                  {rule.label}
                  <span className={styles.srOnly}>{rule.met ? ' (met)' : ' (not met)'}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className={styles.footer}>
        <button
          type="submit"
          className={styles.primaryButton}
          disabled={saving || signingOut}
          aria-busy={saving || undefined}
        >
          <span className={saving ? styles.spin : styles.iconSlot}>
            <Icon name={saving ? 'progress_activity' : 'key'} size={20} weight={600} />
          </span>
          {saving ? 'Updating…' : 'Update password'}
        </button>
      </div>
    </form>
  );
}

// Password input with a key icon and a show / hide button. `state` is 'error', 'ok' or undefined.
function PasswordField({ id, label, value, onChange, autoComplete, state, error, describedBy }) {
  const [visible, setVisible] = useState(false);
  const bad = state === 'error' || !!error;
  const wrapClass = [styles.pwWrap, bad ? styles.pwWrapError : '', state === 'ok' ? styles.pwWrapOk : ''].filter(Boolean).join(' ');
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        <span className={styles.req} aria-hidden="true">
          {' '}
          *
        </span>
      </label>
      <div className={wrapClass}>
        <span className={styles.lead} aria-hidden="true">
          <Icon name="key" size={20} />
        </span>
        <input
          id={id}
          className={styles.pwInput}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          maxLength={64}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-required="true"
          aria-invalid={bad ? 'true' : undefined}
          aria-describedby={[errorId, describedBy].filter(Boolean).join(' ') || undefined}
          spellCheck={false}
          autoCapitalize="none"
        />
        <button
          type="button"
          className={styles.eyeButton}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
        >
          <Icon name={visible ? 'visibility_off' : 'visibility'} size={20} />
        </button>
      </div>
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
