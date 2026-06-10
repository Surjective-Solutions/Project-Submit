'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, UserCircle } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AvatarUpload from '@/components/admin/AvatarUpload';
import PasswordField from '@/components/admin/PasswordField';
import PasswordStrengthIndicator from '@/components/admin/PasswordStrengthIndicator';
import { instructorProfileSchema } from '@/lib/validations/instructor';

function Field({ label, required, error, id, children }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className={error ? 'text-destructive' : 'text-gray-700'}>
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
    </div>
  );
}

function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-3 pt-2 pb-1">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

export default function EditProfileDialog({ open, onOpenChange, instructor, onSave, isLoading }) {
  const [photoUrl, setPhotoUrl] = useState(null);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(instructorProfileSchema),
  });

  const newPasswordValue = watch('new_password', '');
  const firstNameValue = watch('first_name', instructor?.first_name ?? '');
  const lastNameValue = watch('last_name', instructor?.last_name ?? '');

  useEffect(() => {
    if (instructor && open) {
      reset({
        first_name:      instructor.first_name ?? '',
        last_name:       instructor.last_name ?? '',
        email:           instructor.email ?? '',
        contact_number:  instructor.contact_number ?? '',
        subject_area:    instructor.subject_area ?? '',
        employee_id:     instructor.employee_id ?? '',
        new_password:    '',
        confirm_password: '',
      });
      setPhotoUrl(instructor.profile_photo_url ?? null);
    }
  }, [instructor, open, reset]);

  function onSubmit(data) {
    onSave({ ...data, profile_photo_url: photoUrl });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl p-0 gap-0 overflow-hidden max-h-[90vh]"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        {/* Fixed header */}
        <div
          className="px-6 py-5 flex items-center gap-3 shrink-0"
          style={{ background: 'linear-gradient(135deg, #3940A0 0%, #5a62ff 100%)' }}
        >
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <UserCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <DialogTitle className="text-white text-base font-semibold leading-tight m-0">Edit Profile</DialogTitle>
            <DialogDescription className="text-white/60 text-xs mt-0.5 m-0">{instructor?.employee_id}</DialogDescription>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="px-6 py-5 space-y-4">

              {/* Avatar */}
              <div className="flex justify-center pb-1">
                <AvatarUpload
                  key={instructor?.id}
                  name={`${firstNameValue} ${lastNameValue}`}
                  initialUrl={instructor?.profile_photo_url ?? null}
                  onChange={(_, url) => setPhotoUrl(url)}
                  size={80}
                />
              </div>

              {/* Personal */}
              <SectionDivider label="Personal Information" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="First Name" required id="first_name" error={errors.first_name?.message}>
                  <Input id="first_name" placeholder="First name" {...register('first_name')} />
                </Field>
                <Field label="Last Name" required id="last_name" error={errors.last_name?.message}>
                  <Input id="last_name" placeholder="Last name" {...register('last_name')} />
                </Field>
                <Field label="Email" id="email" error={errors.email?.message}>
                  <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
                </Field>
                <Field label="Contact Number" required id="contact_number" error={errors.contact_number?.message}>
                  <Input id="contact_number" placeholder="+94XXXXXXXXX" {...register('contact_number')} />
                </Field>
              </div>

              {/* Professional */}
              <SectionDivider label="Professional Information" />
              <div className="grid grid-cols-1 gap-4">
                <Field label="Subject Area" required id="subject_area" error={errors.subject_area?.message}>
                  <Input id="subject_area" placeholder="e.g. Combined Mathematics" {...register('subject_area')} />
                </Field>
                <Field label="Employee ID" required id="employee_id" error={errors.employee_id?.message}>
                  <Input id="employee_id" placeholder="e.g. INS-2026-00042" {...register('employee_id')} />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Contact your admin to change your Employee ID.
                  </p>
                </Field>
              </div>

              {/* Password */}
              <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-4 space-y-4">
                <SectionDivider label="Change Password" />
                <p className="text-xs text-gray-400">Leave blank to keep current password.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  <div>
                    <PasswordField
                      id="new_password"
                      label="New Password"
                      placeholder="New password (min 8 chars)"
                      error={errors.new_password?.message}
                      registration={register('new_password')}
                    />
                    <PasswordStrengthIndicator value={newPasswordValue} />
                  </div>
                  <PasswordField
                    id="confirm_password"
                    label="Confirm Password"
                    placeholder="Repeat new password"
                    error={errors.confirm_password?.message}
                    registration={register('confirm_password')}
                  />
                </div>
              </div>

              <div className="h-1" />
            </div>
          </div>

          {/* Fixed footer */}
          <div className="shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50/60 rounded-b-xl">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="min-w-[120px] text-white"
              style={{ background: 'linear-gradient(135deg, #3940A0 0%, #5a62ff 100%)' }}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
