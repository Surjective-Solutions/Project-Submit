'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin } from '@/lib/api-client';

const BRAND = {
  red: '#E5242B',
  redHover: '#C81E24',
  blue: '#223385',
  cyan: '#08A5E1',
  yellow: '#F6DF33',
};

function Spinner() {
  return (
    <span
      style={{
        width: 16,
        height: 16,
        borderRadius: '50%',
        border: '2px solid rgba(255,255,255,0.4)',
        borderTopColor: '#fff',
        display: 'inline-block',
        animation: 'admin-login-spin 0.7s linear infinite',
      }}
    />
  );
}

function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        background: '#FFF5F4',
        border: '1px solid #F9D2CE',
        borderRadius: 10,
        padding: '10px 12px',
      }}
    >
      <span
        className="material-symbols-rounded"
        style={{ fontSize: 18, lineHeight: '18px', color: '#9E1117' }}
      >
        error
      </span>
      <p style={{ fontSize: 12.5, color: '#9E1117', margin: 0 }}>{message}</p>
    </div>
  );
}

const primaryButtonStyle = (loading) => ({
  height: 50,
  borderRadius: 13,
  background: BRAND.red,
  border: `2px solid ${BRAND.blue}`,
  boxShadow: `0 3px 0 ${BRAND.blue}`,
  color: '#fff',
  fontSize: 15,
  fontWeight: 800,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  cursor: loading ? 'default' : 'pointer',
  width: '100%',
  transition: 'background-color 0.15s ease',
});

const inputStyle = (invalid) => ({
  height: 46,
  width: '100%',
  boxSizing: 'border-box',
  borderRadius: 12,
  border: `1.5px solid ${invalid ? BRAND.red : '#DADFE9'}`,
  padding: '0 14px',
  fontSize: 15,
  outline: 'none',
});

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ username: false, password: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignIn(e) {
    e.preventDefault();
    const trimmedUsername = username.trim();
    const nextFieldErrors = {
      username: trimmedUsername.length === 0,
      password: password.length === 0,
    };
    setFieldErrors(nextFieldErrors);

    if (nextFieldErrors.username || nextFieldErrors.password) {
      setError('Enter your username and password to continue.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await adminLogin(trimmedUsername, password);
      // NOTE: assumes the response carries the auth token as `token`
      // (matches what protectedRequest/protectedRequestPath read back out of
      // sessionStorage). Adjust the key here if your backend names it
      // differently (e.g. accessToken / jwt).
      const token = res?.token ?? res?.accessToken ?? res?.jwt;
      if (token) {
        sessionStorage.setItem('token', token);
      }
      router.push('/admin/dashboard');
    } catch (err) {
      setFieldErrors({ username: true, password: true });
      const isRawHttpError = /^HTTP Error/i.test(err?.message || '');
      setError(
        !isRawHttpError && err?.message
          ? err.message
          : "That username and password don't match our records.",
      );
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        padding: '32px 20px',
        background:
          'radial-gradient(900px 500px at 50% 0%, rgba(8,165,225,.14), transparent 70%), linear-gradient(170deg,#1C2554 0%,#172C4E 55%,#0F3447 100%)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        <img src="/images/online-logo.png" alt="Syzygy" style={{ height: 80, width: 'auto' }} />
        <span style={{ fontSize: 12, color: 'rgba(214,222,240,.62)' }}>Admin Console</span>
      </div>

      {/* Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: '#fff',
          borderRadius: 20,
          padding: 28,
          boxShadow: '0 24px 60px rgba(5,12,30,.35)',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>
              Sign in
            </h1>
            <p style={{ fontSize: 13.5, color: '#5B6178', margin: '4px 0 0' }}>
              Staff and administrators only.
            </p>
          </div>

          <ErrorBox message={error} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label
              htmlFor="admin-username"
              style={{ fontSize: 13, fontWeight: 600, color: '#33384A' }}
            >
              Username
            </label>
            <input
              id="admin-username"
              type="text"
              autoComplete="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle(fieldErrors.username)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label
              htmlFor="admin-password"
              style={{ fontSize: 13, fontWeight: 600, color: '#33384A' }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ ...inputStyle(fieldErrors.password), paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: '#8B90A0',
                  cursor: 'pointer',
                  display: 'flex',
                }}
              >
                <span className="material-symbols-rounded" style={{ fontSize: 20 }}>
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={primaryButtonStyle(loading)}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = BRAND.redHover;
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = BRAND.red;
            }}
          >
            {loading ? (
              <>
                <Spinner />
                Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#5B6178', margin: 0 }}>
            Forgot password?{' '}
            <button
              type="button"
              onClick={() => setError('Ask a super admin to reset your password.')}
              style={{
                color: BRAND.blue,
                fontWeight: 700,
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Ask a super admin to reset it
            </button>
          </p>
        </form>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span className="material-symbols-rounded" style={{ fontSize: 16, color: 'rgba(214,222,240,.6)' }}>
          shield
        </span>
        <span style={{ fontSize: 12, color: 'rgba(214,222,240,.6)' }}>
          Protected area · all sign-ins are logged
        </span>
      </div>

      <style jsx global>{`
        @keyframes admin-login-spin {
          to {
            transform: rotate(360deg);
          }
        }
        .material-symbols-rounded {
          font-family: 'Material Symbols Rounded';
          font-weight: normal;
          font-style: normal;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          -webkit-font-feature-settings: 'liga';
          -webkit-font-smoothing: antialiased;
        }
      `}</style>
    </div>
  );
}