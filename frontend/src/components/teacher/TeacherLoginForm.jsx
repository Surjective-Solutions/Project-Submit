'use client';

import { useEffect, useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { teacherLogin } from '@/lib/api-client';
import { consumeAccountDeactivatedFlag, consumePasswordResetFlag, consumeSessionExpiredFlag } from '@/lib/auth';
import s from './teacherLogin.module.css';

const REMEMBER_KEY = 'syzygy.teacher.identifier';

export const LOGIN_MESSAGES = {
  identifier: 'Enter your email or phone number.',
  password: 'Enter your password.',
  badCredentials: 'Incorrect email or password.',
  badCredentialsHint: 'Check your details and try again.',
  failed: 'We couldn’t sign you in.',
  failedHint: 'Check your connection and try again.',
  help: 'Contact your institute admin if you need help.',
  forgot: 'Ask your institute admin to reset your password.',
};

function Eye({ off }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {off ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
          <path d="M1 1l22 22" />
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

// The teacher sign-in form. Checks the two fields, signs in through the tutor-login endpoint and opens the dashboard.
export default function TeacherLoginForm() {
  const router = useRouter();
  const uid = useId();
  const ids = { identifier: `${uid}-identifier`, password: `${uid}-password` };

  const [values, setValues] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [status, setStatus] = useState('idle'); // idle | loading | success
  const [failure, setFailure] = useState(null); // { title, hint, credentials }

  // Messages left behind by the session guard: expired session, deactivated account, password reset.
  useEffect(() => {
    const messages = [];
    if (consumeSessionExpiredFlag()) messages.push('Session expired. Please log in again.');
    if (consumeAccountDeactivatedFlag()) messages.push('Your account has been deactivated by an admin.');
    if (consumePasswordResetFlag()) messages.push('Your password was reset by an administrator. Please sign in again.');
    if (messages.length === 0) return;
    // Strict Mode runs this effect twice in dev. The flags are consumed on the first run, so the timer must not be
    // cleared on cleanup, or the toast would be cancelled and never shown.
    setTimeout(() => messages.forEach((message) => toast.error(message)), 0);
  }, []);

  // "Remember me" keeps the email or phone number for next time.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(REMEMBER_KEY);
      if (saved) setValues((current) => (current.identifier ? current : { ...current, identifier: saved }));
    } catch {
      // Storage is optional.
    }
  }, []);

  const busy = status === 'loading' || status === 'success';

  function change(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: '' }));
    if (failure) setFailure(null);
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (busy) return;
    const identifier = values.identifier.trim();
    const found = {};
    if (!identifier) found.identifier = LOGIN_MESSAGES.identifier;
    if (!values.password) found.password = LOGIN_MESSAGES.password;
    setErrors(found);
    setFailure(null);
    if (found.identifier || found.password) {
      document.getElementById(found.identifier ? ids.identifier : ids.password)?.focus();
      return;
    }

    setStatus('loading');
    try {
      const result = await teacherLogin(identifier, values.password);
      if (result?.isSuccess) {
        sessionStorage.setItem('token', result.token);
        sessionStorage.setItem('role', result.role);
        try {
          if (remember) window.localStorage.setItem(REMEMBER_KEY, identifier);
          else window.localStorage.removeItem(REMEMBER_KEY);
        } catch {
          // Storage is optional.
        }
        setStatus('success');
        router.push('/teacher/dashboard');
        return;
      }
      // Wrong details read as "Incorrect email or password."; any other reason the server gives (a deactivated
      // account, say) is shown as it is.
      const reason = String(result?.message || '').trim();
      const credentials = !reason || /invalid|incorrect|credential|password|wrong|not found/i.test(reason);
      setFailure(
        credentials
          ? { title: LOGIN_MESSAGES.badCredentials, hint: LOGIN_MESSAGES.badCredentialsHint, credentials: true }
          : { title: reason, hint: LOGIN_MESSAGES.help, credentials: false },
      );
      setStatus('idle');
    } catch {
      setFailure({ title: LOGIN_MESSAGES.failed, hint: LOGIN_MESSAGES.failedHint, credentials: false });
      setStatus('idle');
    }
  }

  const credentialsWrong = failure?.credentials === true;
  const idInvalid = !!errors.identifier || credentialsWrong;
  const pwInvalid = !!errors.password || credentialsWrong;

  return (
    <form className={s.form} onSubmit={onSubmit} noValidate aria-label="Teacher sign in">
      <div className={s.heading}>
        <h1 className={s.title}>Teacher sign in</h1>
        <p className={s.helper}>Use the email or phone number registered with your institute.</p>
      </div>

      {failure && (
        <div className={s.banner} role="alert">
          <span className={s.bannerIcon} aria-hidden="true">
            !
          </span>
          <span>
            <strong className={s.bannerTitle}>{failure.title}</strong>
            <span className={s.bannerText}>{failure.hint}</span>
          </span>
        </div>
      )}

      <div className={s.field}>
        <label className={s.label} htmlFor={ids.identifier}>
          Email or phone number
        </label>
        <input
          id={ids.identifier}
          className={s.input}
          type="text"
          inputMode="email"
          autoComplete="username"
          placeholder="e.g. nimal.perera@gmail.com"
          value={values.identifier}
          onChange={(event) => change('identifier', event.target.value)}
          disabled={busy}
          aria-invalid={idInvalid}
          aria-describedby={errors.identifier ? `${ids.identifier}-error` : undefined}
          autoCapitalize="none"
          spellCheck={false}
        />
        {errors.identifier && (
          <p id={`${ids.identifier}-error`} className={s.fieldError}>
            {errors.identifier}
          </p>
        )}
      </div>

      <div className={s.field}>
        <label className={s.label} htmlFor={ids.password}>
          Password
        </label>
        <div className={s.control}>
          <input
            id={ids.password}
            className={`${s.input} ${s.inputWithToggle}`}
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={values.password}
            onChange={(event) => change('password', event.target.value)}
            disabled={busy}
            aria-invalid={pwInvalid}
            aria-describedby={errors.password ? `${ids.password}-error` : undefined}
          />
          <button
            type="button"
            className={s.toggle}
            onClick={() => setShowPassword((value) => !value)}
            aria-pressed={showPassword}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <Eye off={showPassword} />
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        {errors.password && (
          <p id={`${ids.password}-error`} className={s.fieldError}>
            {errors.password}
          </p>
        )}
      </div>

      <div className={s.optionsRow}>
        <label className={s.remember}>
          <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
          Remember me
        </label>
        <button type="button" className={s.linkButton} onClick={() => toast.info(LOGIN_MESSAGES.forgot)}>
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        className={`${s.submit} ${status === 'success' ? s.submitDone : ''}`}
        disabled={busy}
        aria-busy={status === 'loading'}
      >
        {status === 'loading' && <span className={s.spinner} aria-hidden="true" />}
        {status === 'loading' ? 'Signing in…' : status === 'success' ? 'Signed in — opening your classes…' : 'Sign in'}
      </button>

      <div className={s.formFooter}>
        <span>Need help? Contact your institute admin.</span>
        <span>© 2026 Syzygy</span>
      </div>
    </form>
  );
}
