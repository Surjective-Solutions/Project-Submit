'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import PasswordField from './PasswordField';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import AvatarUpload from './AvatarUpload';
import { editTutorSchema, editCashierSchema } from '@/lib/validations/admin';

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

export default function EditStaffDialog({
  open,
  onOpenChange,
  person,
  variant,
  onSave,
  isLoading,
}) {
  const schema = variant === 'tutor' ? editTutorSchema : editCashierSchema;
  const [photoUrl, setPhotoUrl] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues:
      variant === 'tutor'
        ? { displayName: '', email: '', contactNumber: '', subject: '', newUsername: '', newPassword: '', confirmNewPassword: '' }
        : { fullName: '', email: '', newUsername: '', newPassword: '', confirmNewPassword: '' },
  });

  const newPasswordValue = watch('newPassword', '');
  const displayNameValue = watch('displayName', '');

  useEffect(() => {
    if (person && open) {
      if (variant === 'tutor') {
        reset({
          displayName: person.displayName ?? '',
          email: person.email ?? '',
          contactNumber: person.contactNumber ?? '',
          subject: person.subject ?? '',
          newUsername: '',
          newPassword: '',
          confirmNewPassword: '',
        });
        setPhotoUrl(person.profilePhotoUrl ?? null);
      } else {
        reset({
          fullName: person.fullName ?? '',
          email: person.email ?? '',
          newUsername: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      }
    }
  }, [person, open, variant, reset]);

  if (!person) return null;

  function handleFormSubmit(data) {
    onSave({
      ...data,
      ...(variant === 'tutor' ? { profilePhotoUrl: photoUrl } : {}),
    });
  }

  const title = variant === 'tutor' ? 'Edit Tutor' : 'Edit Cashier';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-4 mt-2">
          {variant === 'tutor' ? (
            <>
              {/* Profile photo */}
              <div className="flex justify-center pb-1">
                <AvatarUpload
                  key={person.id}
                  name={displayNameValue || person.displayName}
                  initialUrl={person.profilePhotoUrl ?? null}
                  onChange={(_file, url) => setPhotoUrl(url)}
                  size={80}
                />
              </div>

              <Field label="Display Name" required id="displayName" error={errors.displayName?.message}>
                <Input id="displayName" {...register('displayName')} aria-invalid={!!errors.displayName} />
              </Field>
              <Field label="Email" required id="email" error={errors.email?.message}>
                <Input id="email" type="email" {...register('email')} aria-invalid={!!errors.email} />
              </Field>
              <Field label="Contact Number" required id="contactNumber" error={errors.contactNumber?.message}>
                <PhoneInput
                  id="contactNumber"
                  error={errors.contactNumber}
                  value={watch('contactNumber')}
                  onChange={(v) => setValue('contactNumber', v, { shouldValidate: true })}
                  onBlur={() => {}}
                />
              </Field>
              <Field label="Subject" required id="subject" error={errors.subject?.message}>
                <Input id="subject" {...register('subject')} aria-invalid={!!errors.subject} />
              </Field>
            </>
          ) : (
            <>
              <Field label="Full Name" required id="fullName" error={errors.fullName?.message}>
                <Input id="fullName" {...register('fullName')} aria-invalid={!!errors.fullName} />
              </Field>
              <Field label="Email" required id="email" error={errors.email?.message}>
                <Input id="email" type="email" {...register('email')} aria-invalid={!!errors.email} />
              </Field>
            </>
          )}

          {/* Credentials section */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <p className="text-xs text-gray-400 whitespace-nowrap">
                Change Credentials — leave blank to keep existing
              </p>
              <Separator className="flex-1" />
            </div>

            <Field label="New Username" id="newUsername" error={errors.newUsername?.message}>
              <Input
                id="newUsername"
                placeholder="Leave blank to keep current"
                autoComplete="username"
                {...register('newUsername')}
                aria-invalid={!!errors.newUsername}
              />
            </Field>

            <div>
              <PasswordField
                id="newPassword"
                label="New Password"
                placeholder="Leave blank to keep current"
                error={errors.newPassword?.message}
                registration={register('newPassword')}
              />
              <PasswordStrengthIndicator value={newPasswordValue} />
            </div>

            <PasswordField
              id="confirmNewPassword"
              label="Confirm New Password"
              placeholder="Repeat new password"
              error={errors.confirmNewPassword?.message}
              registration={register('confirmNewPassword')}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            style={{ backgroundColor: '#3940A0' }}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
