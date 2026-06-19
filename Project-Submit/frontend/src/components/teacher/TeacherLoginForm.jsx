'use client';

import { useState } from 'react';
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
import { teacherLoginSchema } from '@/lib/validations/admin';
import { teacherLogin } from '@/lib/api-client';

export default function TeacherLoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(teacherLoginSchema),
    defaultValues: { username: '', password: '' },
  });

  async function onSubmit(data) {
    setIsLoading(true);
    try {
      const result = await teacherLogin(data.username, data.password);
      toast.success(result.message ?? 'Logged in successfully');
      router.push('/teacher/dashboard');
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
          placeholder="teacher_username"
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
        style={{ background: 'linear-gradient(135deg, #3940A0 0%, #5a62ff 100%)' }}
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Login to Teacher Portal
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
