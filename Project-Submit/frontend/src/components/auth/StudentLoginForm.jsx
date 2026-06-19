'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import GoogleIcon from './GoogleIcon';
import { studentLoginSchema } from '@/lib/validations/student';
import { studentLogin } from '@/lib/api-client';

export default function StudentLoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(studentLoginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  async function onSubmit(data) {
    setIsLoading(true);
    try {
      const result = await studentLogin(data.identifier, data.password);
      toast.success(result.message ?? 'Logged in successfully');
      router.push('/student/dashboard');
    } catch {
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {/* Email / phone */}
      <div className="space-y-1.5">
        <Label htmlFor="identifier">Email or contact number</Label>
        <Input
          id="identifier"
          autoComplete="username"
          placeholder="name@example.com or +94XXXXXXXXX"
          aria-invalid={!!errors.identifier}
          aria-describedby={errors.identifier ? 'identifier-error' : undefined}
          {...register('identifier')}
        />
        {errors.identifier && (
          <p id="identifier-error" className="text-xs text-destructive" role="alert">
            {errors.identifier.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs text-gray-500 hover:text-gray-800 transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Enter your password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            className="pr-10"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" className="text-xs text-destructive" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full h-9 bg-[#0f172a] text-white hover:bg-[#1e293b] active:bg-[#0f172a]"
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Log in
      </Button>

      {/* Divider */}
      <div className="relative flex items-center gap-3 py-1">
        <Separator className="flex-1" />
        <span className="text-xs text-gray-400">or</span>
        <Separator className="flex-1" />
      </div>

      {/* Google */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-9 gap-2"
        onClick={() => toast.info('Google sign-in coming soon')}
      >
        <GoogleIcon />
        Continue with Google
      </Button>

      {/* Sign up link */}
      <p className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-semibold text-gray-900 hover:underline">
          Sign up
        </Link>
      </p>

      {/* Instructor link */}
      <p className="text-center text-xs text-gray-400 pt-1">
        Are you an instructor?{' '}
        <Link href="/instructor/login" className="text-gray-500 hover:underline">
          Login here
        </Link>
      </p>
    </form>
  );
}
