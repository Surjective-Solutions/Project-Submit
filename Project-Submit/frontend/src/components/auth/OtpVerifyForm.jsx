'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { verifyOtp, resendOtp } from '@/lib/api-client';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

// Masked phone display — shows last 3 digits
const MASKED_PHONE = '+94 *** *** 789';

export default function OtpVerifyForm() {
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef([]);

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
    if (otp.length < OTP_LENGTH) {
      toast.error('Please enter all 6 digits');
      return;
    }
    setIsLoading(true);
    try {
      const result = await verifyOtp(MASKED_PHONE, otp);
      toast.success(result.message ?? 'Phone number verified!');
    } catch {
      toast.error('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    if (countdown > 0) return;
    try {
      await resendOtp(MASKED_PHONE);
      toast.success('OTP resent successfully');
      setCountdown(RESEND_COOLDOWN);
      setDigits(Array(OTP_LENGTH).fill(''));
      focusAt(0);
    } catch {
      toast.error('Could not resend OTP. Please try again.');
    }
  }

  const otp = digits.join('');
  const isComplete = otp.length === OTP_LENGTH && digits.every(Boolean);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const countdownLabel = `${minutes}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      {/* Description */}
      <p className="text-sm text-gray-500">
        We sent a 6-digit code to{' '}
        <span className="font-medium text-gray-700">{MASKED_PHONE}</span>
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
            className="w-11 h-12 rounded-xl border text-center text-lg font-semibold transition-all outline-none
              border-gray-200 bg-gray-50 text-gray-900
              focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 focus:bg-white
              caret-transparent"
          />
        ))}
      </div>

      {/* Resend */}
      <p className="text-center text-sm text-gray-500">
        {countdown > 0 ? (
          <>
            Resend code in{' '}
            <span className="font-medium text-gray-700">{countdownLabel}</span>
          </>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="font-medium text-gray-900 hover:underline"
          >
            Resend code
          </button>
        )}
      </p>

      {/* Verify button */}
      <Button
        type="button"
        onClick={handleVerify}
        disabled={!isComplete || isLoading}
        className="w-full h-9 bg-[#0f172a] text-white hover:bg-[#1e293b]"
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Verify
      </Button>

      {/* Back link */}
      <p className="text-center">
        <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← Back to login
        </Link>
      </p>
    </div>
  );
}
