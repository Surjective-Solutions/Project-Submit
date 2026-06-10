'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PasswordField from './PasswordField';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { createCashierSchema } from '@/lib/validations/admin';
import { createCashier } from '@/lib/api-client';

function Field({ label, required, error, id, children }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className={error ? 'text-destructive' : ''}>
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default function AddCashierSheet({ open, onOpenChange, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createCashierSchema),
    defaultValues: {
      fullName: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password', '');

  async function onSubmit(data) {
    setIsLoading(true);
    try {
      await createCashier(data);
      toast.success('Cashier created successfully');
      reset();
      onOpenChange(false);
      onSuccess(data);
    } catch {
      toast.error('Failed to create cashier. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle>Add New Cashier</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Field label="Full Name" required id="fullName" error={errors.fullName?.message}>
            <Input
              id="fullName"
              placeholder="Jane Smith"
              aria-invalid={!!errors.fullName}
              {...register('fullName')}
            />
          </Field>

          <Field label="Email" required id="email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              placeholder="cashier@submitx.app"
              aria-invalid={!!errors.email}
              {...register('email')}
            />
          </Field>

          <Field label="Username" required id="username" error={errors.username?.message}>
            <Input
              id="username"
              placeholder="cashier_username"
              autoComplete="off"
              aria-invalid={!!errors.username}
              {...register('username')}
            />
          </Field>

          <div>
            <PasswordField
              id="password"
              label="Password"
              required
              placeholder="Create a strong password"
              error={errors.password?.message}
              registration={register('password')}
            />
            <PasswordStrengthIndicator value={passwordValue} />
          </div>

          <PasswordField
            id="confirmPassword"
            label="Confirm Password"
            required
            placeholder="Repeat your password"
            error={errors.confirmPassword?.message}
            registration={register('confirmPassword')}
          />

          <Button
            type="submit"
            className="w-full text-white"
            style={{ backgroundColor: '#3940A0' }}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Create Cashier
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
