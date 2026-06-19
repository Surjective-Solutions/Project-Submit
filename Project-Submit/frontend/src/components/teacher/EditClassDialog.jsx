'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Pencil } from 'lucide-react';
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
import AvatarUpload from '@/components/admin/AvatarUpload';
import { teacherClassSchema } from '@/lib/validations/teacher';
import { updateClass } from '@/lib/api-client';

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

export default function EditClassDialog({ open, onOpenChange, classItem, onSave }) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(teacherClassSchema),
  });

  const titleValue = watch('title', classItem?.title ?? '');

  useEffect(() => {
    if (classItem && open) {
      reset({
        title: classItem.title,
        description: classItem.description,
        subject: classItem.subject,
        grade: classItem.grade,
        fee: classItem.fee,
      });
      setImageUrl(classItem.imageUrl ?? null);
    }
  }, [classItem, open, reset]);

  async function onSubmit(data) {
    setIsLoading(true);
    try {
      await updateClass(classItem.id, { ...data, imageUrl });
      toast.success('Class updated successfully');
      onOpenChange(false);
      onSave({ ...classItem, ...data, imageUrl });
    } catch {
      toast.error('Failed to update class. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg, #3940A0 0%, #5a62ff 100%)' }}
        >
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <Pencil className="h-5 w-5 text-white" />
          </div>
          <div>
            <DialogTitle className="text-white text-base font-semibold leading-tight m-0">
              Edit Class
            </DialogTitle>
            <DialogDescription className="text-white/60 text-xs mt-0.5 m-0">
              Update class details.
            </DialogDescription>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto"
        >
          {/* Image upload */}
          <div className="flex justify-center">
            <AvatarUpload
              key={classItem?.id}
              name={titleValue}
              initialUrl={classItem?.imageUrl ?? null}
              onChange={(_, url) => setImageUrl(url)}
              size={80}
            />
          </div>

          <Separator />

          <Field label="Display Name" required id="title" error={errors.title?.message}>
            <Input
              id="title"
              placeholder="e.g. Advanced Mathematics"
              aria-invalid={!!errors.title}
              {...register('title')}
            />
          </Field>

          <Field label="Description" required id="description" error={errors.description?.message}>
            <textarea
              id="description"
              placeholder="Describe what this class covers..."
              rows={3}
              aria-invalid={!!errors.description}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              {...register('description')}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Subject" required id="subject" error={errors.subject?.message}>
              <Input
                id="subject"
                placeholder="e.g. Mathematics"
                aria-invalid={!!errors.subject}
                {...register('subject')}
              />
            </Field>
            <Field label="Grade" required id="grade" error={errors.grade?.message}>
              <Input
                id="grade"
                placeholder="e.g. Grade 12"
                aria-invalid={!!errors.grade}
                {...register('grade')}
              />
            </Field>
          </div>

          <Field label="Monthly Fee (LKR)" required id="fee" error={errors.fee?.message}>
            <Input
              id="fee"
              type="number"
              min="0"
              placeholder="e.g. 2500"
              aria-invalid={!!errors.fee}
              {...register('fee')}
            />
          </Field>

          <div className="flex items-center justify-end gap-3 pt-1">
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
