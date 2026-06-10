'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { instructorLoginSchema } from '@/lib/validations/instructor';
import { instructorLogin } from '@/lib/api-client';

export default function InstructorLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(instructorLoginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(data) {
    setIsLoading(true);
    try {
      const result = await instructorLogin(data.email, data.password);
      toast.success(result.message ?? 'Logged in successfully');
    } catch {
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="username"
          placeholder="name@school.edu"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          {...register('email')}
        />
        {errors.email && (
          <p id="email-error" className="text-xs text-destructive" role="alert">
            {errors.email.message}
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
        className="w-full h-9 bg-[#0f172a] text-white hover:bg-[#1e293b]"
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Log in
      </Button>

      {/* Footer links */}
      <p className="text-center text-xs text-gray-400">
        <Link href="/login" className="hover:text-gray-600 transition-colors">
          ← Back to student login
        </Link>
      </p>
      <p className="text-center text-xs text-gray-400">
        New instructor?{' '}
        <Link href="/instructor/register" className="text-gray-500 hover:underline font-medium">
          Apply here
        </Link>
      </p>
    </form>
  );
}
