'use client';

import { useState, useRef, useEffect, useCallback, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { sendOtp, verifyOtp } from '@/lib/api-client';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 45;
const IDENTIFIER_KEY = 'otp_identifier';

function maskIdentifier(identifier) {
  if (!identifier) return '';

  if (identifier.includes('@')) {
    const [name, domain] = identifier.split('@');
    const first = name?.[0] ?? '';
    return `Sent to ${first}${'•'.repeat(3)}@${domain}`;
  }

  const digits = identifier.replace(/\D/g, '');
  const lastFour = digits.slice(-4);
  const prefix = identifier.startsWith('+') ? identifier.slice(0, 3) : '';
  return `Sent to ${prefix} •••• ${lastFour}`;
}

function subscribeToIdentifier(callback) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getStoredIdentifier() {
  return sessionStorage.getItem(IDENTIFIER_KEY) ?? '';
}

export default function OtpVerifyForm({ role = 'student' }) {
  const router = useRouter();
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);
  const identifier = useSyncExternalStore(subscribeToIdentifier, getStoredIdentifier, () => '');

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown((v) => v - 1), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  const focusAt = useCallback((index) => {
    inputRefs.current[index]?.focus();
  }, []);

  function handleChange(index, e) {
    const raw = e.target.value;
    setError('');
    // Accept paste: fill from index forward
    if (raw.length > 1) {
      const pastedDigits = raw.replace(/\D/g, '').slice(0, OTP_LENGTH - index);
      setDigits((prev) => {
        const next = [...prev];
        for (let i = 0; i < pastedDigits.length; i++) {
          next[index + i] = pastedDigits[i];
        }
        return next;
      });
      const nextFocus = Math.min(index + pastedDigits.length, OTP_LENGTH - 1);
      setTimeout(() => focusAt(nextFocus), 0);
      return;
    }

    const digit = raw.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < OTP_LENGTH - 1) {
      setTimeout(() => focusAt(index + 1), 0);
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        setDigits((prev) => {
          const next = [...prev];
          next[index] = '';
          return next;
        });
      } else if (index > 0) {
        setDigits((prev) => {
          const next = [...prev];
          next[index - 1] = '';
          return next;
        });
        focusAt(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusAt(index - 1);
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      focusAt(index + 1);
    }
  }

  async function handleVerify() {
    const otp = digits.join('');
    if (otp.length < OTP_LENGTH || !identifier) {
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const result = await verifyOtp(otp, identifier);
      if (!result?.success) {
        setError('Invalid OTP. Please try again.');
        return;
      }

      sessionStorage.removeItem(IDENTIFIER_KEY);
      router.push(role === 'instructor' ? '/instructor/dashboard' : '/student/dashboard');
    } catch {
      setError('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    if (countdown > 0 || !identifier || isResending) return;
    setIsResending(true);
    try {
      await sendOtp(identifier);
      toast.success('OTP resent successfully');
      setCountdown(RESEND_COOLDOWN);
      setDigits(Array(OTP_LENGTH).fill(''));
      setError('');
      focusAt(0);
    } catch {
      toast.error('Could not resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  }

  const otp = digits.join('');
  const isComplete = otp.length === OTP_LENGTH && digits.every(Boolean);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const countdownLabel = `${minutes}:${String(seconds).padStart(2, '0')}`;
  const maskedIdentifier = maskIdentifier(identifier);

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-900">
          <ShieldCheck className="h-5 w-5" />
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-500">
        {maskedIdentifier || 'Complete registration again to request a new verification code.'}
      </p>

      {/* OTP inputs */}
      <div
        className="flex gap-2 justify-center"
        role="group"
        aria-label="One-time password input"
      >
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (inputRefs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={OTP_LENGTH}
            value={digit}
            autoFocus={i === 0}
            aria-label={`Digit ${i + 1}`}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onFocus={(e) => e.target.select()}
            disabled={!identifier || isLoading}
            className="w-11 h-12 rounded-xl border text-center text-lg font-semibold transition-all outline-none
              border-gray-200 bg-gray-50 text-gray-900
              focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 focus:bg-white
              disabled:cursor-not-allowed disabled:opacity-60
              caret-transparent"
          />
        ))}
      </div>

      {error && (
        <p className="text-center text-sm text-destructive" role="alert">
          {error}{' '}
          {countdown <= 0 && (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || !identifier}
              className="font-medium underline disabled:cursor-not-allowed disabled:opacity-60"
            >
              Resend OTP
            </button>
          )}
        </p>
      )}

      {/* Resend */}
      <p className="text-center text-sm text-gray-500">
        {countdown > 0 ? (
          <>
            Resend OTP in{' '}
            <span className="font-medium text-gray-700">{countdownLabel}</span>
          </>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || !identifier}
            className="font-medium text-gray-900 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isResending ? 'Resending...' : 'Resend OTP'}
          </button>
        )}
      </p>

      {/* Verify button */}
      <Button
        type="button"
        onClick={handleVerify}
        disabled={!isComplete || isLoading || !identifier}
        className="w-full h-9 bg-[#0f172a] text-white hover:bg-[#1e293b]"
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        {isLoading ? 'Verifying...' : 'Verify OTP'}
      </Button>

      {/* Back link */}
      <p className="text-center">
        <Link href={role === 'instructor' ? '/instructor/register' : '/register'} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← Back to register
        </Link>
      </p>
    </div>
  );
}
