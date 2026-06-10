'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { createTutorSchema } from '@/lib/validations/admin';
import { createTutor } from '@/lib/api-client';

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

function PhoneInput({ id, error, value, onChange, onBlur }) {
  return (
    <div className="flex">
      <span className="inline-flex items-center rounded-l-lg border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground select-none">
        +94
      </span>
      <Input
        id={id}
        type="tel"
        inputMode="numeric"
        maxLength={9}
        placeholder="XXXXXXXXX"
        aria-invalid={!!error}
        value={value?.replace(/^\+94/, '') ?? ''}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
          onChange(digits ? `+94${digits}` : '');
        }}
        onBlur={onBlur}
        className="rounded-l-none"
      />
    </div>
  );
}

export default function AddTutorSheet({ open, onOpenChange, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createTutorSchema),
    defaultValues: {
      displayName: '',
      email: '',
      contactNumber: '',
      subject: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password', '');

  async function onSubmit(data) {
    setIsLoading(true);
    try {
      await createTutor(data);
      toast.success('Tutor created successfully');
      reset();
      onOpenChange(false);
      onSuccess(data);
    } catch {
      toast.error('Failed to create tutor. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle>Add New Tutor</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Field label="Display Name" required id="displayName" error={errors.displayName?.message}>
            <Input
              id="displayName"
              placeholder="Dr. Jane Smith"
              aria-invalid={!!errors.displayName}
              {...register('displayName')}
            />
          </Field>

          <Field label="Email" required id="email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              placeholder="tutor@submitx.app"
              aria-invalid={!!errors.email}
              {...register('email')}
            />
          </Field>

          <Field label="Contact Number" required id="contactNumber" error={errors.contactNumber?.message}>
            <Controller
              control={control}
              name="contactNumber"
              render={({ field }) => (
                <PhoneInput id="contactNumber" error={errors.contactNumber} {...field} />
              )}
            />
          </Field>

          <Field label="Subject" required id="subject" error={errors.subject?.message}>
            <Input
              id="subject"
              placeholder="e.g. Mathematics, Biology"
              aria-invalid={!!errors.subject}
              {...register('subject')}
            />
          </Field>

          <Field label="Username" required id="username" error={errors.username?.message}>
            <Input
              id="username"
              placeholder="tutor_username"
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
            Create Tutor
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
