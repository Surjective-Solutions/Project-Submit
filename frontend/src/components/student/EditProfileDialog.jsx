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
import { studentEditSchema } from '@/lib/validations/admin';

const SELECT_CLASS =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50';

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

export default function EditProfileDialog({ open, onOpenChange, student, onSave, isLoading }) {
  const [photoUrl, setPhotoUrl] = useState(null);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(studentEditSchema),
  });

  const newPasswordValue = watch('new_password', '');
  const firstNameValue = watch('first_name', student?.first_name ?? '');
  const lastNameValue = watch('last_name', student?.last_name ?? '');

  useEffect(() => {
    if (student && open) {
      reset({
        first_name:       student.first_name ?? '',
        last_name:        student.last_name ?? '',
        contact_number:   student.contact_number ?? '',
        whatsapp_number:  student.whatsapp_number ?? '',
        email:            student.email ?? '',
        date_of_birth:    student.date_of_birth ?? '',
        gender:           student.gender ?? 'MALE',
        school_name:      student.school_name ?? '',
        grade:            student.grade ?? '',
        subject_stream:   student.subject_stream ?? '',
        district:         student.district ?? '',
        guardian_name:    student.guardian_name ?? '',
        guardian_contact: student.guardian_contact ?? '',
        address:          student.address ?? '',
        new_password:     '',
        confirm_password: '',
      });
      setPhotoUrl(student.profile_photo_url ?? null);
    }
  }, [student, open, reset]);

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
            <DialogDescription className="text-white/60 text-xs mt-0.5 m-0">{student?.student_number}</DialogDescription>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="px-6 py-5 space-y-4">

              {/* Avatar */}
              <div className="flex justify-center pb-1">
                <AvatarUpload
                  key={student?.id}
                  name={`${firstNameValue} ${lastNameValue}`}
                  initialUrl={student?.profile_photo_url ?? null}
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
                <Field label="Date of Birth" id="date_of_birth" error={errors.date_of_birth?.message}>
                  <Input id="date_of_birth" type="date" {...register('date_of_birth')} />
                </Field>
                <Field label="Gender" required id="gender" error={errors.gender?.message}>
                  <select id="gender" className={SELECT_CLASS} {...register('gender')}>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </Field>
                <Field label="Contact Number" required id="contact_number" error={errors.contact_number?.message}>
                  <Input id="contact_number" placeholder="+94XXXXXXXXX" {...register('contact_number')} />
                </Field>
                <Field label="WhatsApp Number" id="whatsapp_number" error={errors.whatsapp_number?.message}>
                  <Input id="whatsapp_number" placeholder="+94XXXXXXXXX" {...register('whatsapp_number')} />
                </Field>
                <Field label="Email" id="email" error={errors.email?.message}>
                  <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
                </Field>
              </div>

              {/* Academic */}
              <SectionDivider label="Academic Information" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="School Name" id="school_name" error={errors.school_name?.message}>
                  <Input id="school_name" placeholder="School name" {...register('school_name')} />
                </Field>
                <Field label="Grade" id="grade" error={errors.grade?.message}>
                  <Input id="grade" placeholder="e.g. Grade 12" {...register('grade')} />
                </Field>
                <Field label="Subject Stream" id="subject_stream" error={errors.subject_stream?.message}>
                  <select id="subject_stream" className={SELECT_CLASS} {...register('subject_stream')}>
                    <option value="">Select stream</option>
                    <option value="Physical Science">Physical Science</option>
                    <option value="Biological Science">Biological Science</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Arts">Arts</option>
                    <option value="Technology">Technology</option>
                    <option value="Combined Mathematics">Combined Mathematics</option>
                    <option value="Other">Other</option>
                  </select>
                </Field>
                <Field label="District" id="district" error={errors.district?.message}>
                  <Input id="district" placeholder="e.g. Colombo" {...register('district')} />
                </Field>
              </div>

              {/* Guardian */}
              <SectionDivider label="Guardian Information" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Guardian Name" id="guardian_name" error={errors.guardian_name?.message}>
                  <Input id="guardian_name" placeholder="Guardian name" {...register('guardian_name')} />
                </Field>
                <Field label="Guardian Contact" id="guardian_contact" error={errors.guardian_contact?.message}>
                  <Input id="guardian_contact" placeholder="+94XXXXXXXXX" {...register('guardian_contact')} />
                </Field>
              </div>

              {/* Address */}
              <SectionDivider label="Address" />
              <Field label="Full Address" id="address" error={errors.address?.message}>
                <textarea
                  id="address"
                  rows={2}
                  placeholder="Street, city, postal code"
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring resize-none"
                  {...register('address')}
                />
              </Field>

              {/* Password */}
              <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-4 space-y-4">
                <SectionDivider label="Change Password" />
                <p className="text-xs text-gray-400">Leave blank to keep the current password.</p>
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
