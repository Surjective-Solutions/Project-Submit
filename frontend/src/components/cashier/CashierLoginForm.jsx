'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PasswordField from '@/components/admin/PasswordField';
import { cashierLoginSchema } from '@/lib/validations/admin';
import { cashierLogin } from '@/lib/api-client';
import { consumeSessionExpiredFlag, consumeAccountDeactivatedFlag, consumePasswordResetFlag } from '@/lib/auth';

export default function CashierLoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(cashierLoginSchema),
    defaultValues: { username: '', password: '' },
  });

  useEffect(() => {
    const messages = [];
    if (consumeSessionExpiredFlag()) {
      messages.push('Session expired. Please log in again.');
    }
    if (consumeAccountDeactivatedFlag()) {
      messages.push('Your account has been deactivated by an admin.');
    }
    if (consumePasswordResetFlag()) {
      messages.push('Your password was reset by an administrator. Please sign in again.');
    }
    if (messages.length === 0) return;

    // Strict Mode runs this effect twice in dev. The flags are consumed on the first run, so the
    // timer must NOT be cleared on cleanup, or the toast would be cancelled and never shown.
    setTimeout(() => messages.forEach((message) => toast.error(message)), 0);
  }, []);

  async function onSubmit(data) {
    setIsLoading(true);
    try {
      const result = await cashierLogin(data.username, data.password);
      if (result.isSuccess) {
        sessionStorage.setItem('token', result.token);
        sessionStorage.setItem('role', result.role);
        toast.success(result.message ?? 'Logged in successfully');
        router.push('/cashier/dashboard');
      } else {
        toast.error(result.message ?? 'Invalid credentials');
      }
    } catch {
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {/* Username */}
      <div className="space-y-1.5">
        <Label htmlFor="username" className={errors.username ? 'text-destructive' : ''}>
          Username
        </Label>
        <Input
          id="username"
          autoComplete="username"
          placeholder="cashier_username"
          aria-invalid={!!errors.username}
          aria-describedby={errors.username ? 'username-error' : undefined}
          {...register('username')}
        />
        {errors.username && (
          <p id="username-error" className="text-xs text-destructive" role="alert">
            {errors.username.message}
          </p>
        )}
      </div>

      {/* Password */}
      <PasswordField
        id="password"
        label="Password"
        required
        placeholder="Enter your password"
        autoComplete="current-password"
        error={errors.password?.message}
        registration={register('password')}
      />

      {/* Submit */}
      <Button
        type="submit"
        className="w-full h-9 text-white"
        style={{ background: 'linear-gradient(135deg, #053A34 0%, #0d6b5e 100%)' }}
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Login to Cashier Portal
      </Button>

      {/* Back link */}
      <p className="text-center text-xs text-gray-400 pt-1">
        <Link href="/login" className="text-gray-500 hover:underline">
          ← Back to student login
        </Link>
      </p>
    </form>
  );
}
