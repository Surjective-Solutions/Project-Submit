'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, GraduationCap } from 'lucide-react';
import AvatarUpload from './AvatarUpload';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import PasswordField from './PasswordField';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { createTutorSchema } from '@/lib/validations/admin';
import { createTutor } from '@/lib/api-client';

function Field({ label, required, error, id, children }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className={error ? 'text-destructive' : 'text-gray-700'}>
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
      <span className="inline-flex items-center rounded-l-lg border border-r-0 border-input bg-gray-50 px-3 text-sm text-gray-500 select-none font-medium">
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

export default function AddTutorDialog({ open, onOpenChange, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);

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
  const displayNameValue = watch('displayName', '');

  async function onSubmit(data) {
    setIsLoading(true);
    try {
      await createTutor(data);
      toast.success('Tutor created successfully');
      reset();
      setPhotoUrl(null);
      onOpenChange(false);
      onSuccess({ ...data, profilePhotoUrl: photoUrl });
    } catch {
      toast.error('Failed to create tutor. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
        {/* Coloured header strip */}
        <div
          className="px-6 py-5 flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg, #3940A0 0%, #5a62ff 100%)' }}
        >
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <DialogTitle className="text-white text-base font-semibold leading-tight m-0">
              Add New Tutor
            </DialogTitle>
            <DialogDescription className="text-white/60 text-xs mt-0.5 m-0">
              Fill in the details below to create a tutor account.
            </DialogDescription>
          </div>
        </div>

        {/* Form body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto"
        >
          {/* Profile photo */}
          <div className="flex justify-center pb-1">
            <AvatarUpload
              name={displayNameValue}
              initialUrl={null}
              onChange={(_file, url) => setPhotoUrl(url)}
              size={80}
            />
          </div>

          {/* Row 1: Name + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          {/* Row 2: Contact + Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          <Separator />

          {/* Row 3: Username */}
          <Field label="Username" required id="username" error={errors.username?.message}>
            <Input
              id="username"
              placeholder="tutor_username"
              autoComplete="off"
              aria-invalid={!!errors.username}
              {...register('username')}
            />
          </Field>

          {/* Row 4: Password + Confirm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
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
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="min-w-[130px] text-white"
              style={{ background: 'linear-gradient(135deg, #3940A0 0%, #5a62ff 100%)' }}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Create Tutor
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
