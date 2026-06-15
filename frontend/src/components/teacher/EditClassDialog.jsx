'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Pencil } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { teacherClassSchema } from '@/lib/validations/teacher';

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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(teacherClassSchema),
  });

  useEffect(() => {
    if (classItem && open) {
      reset({
        display_name: classItem.display_name,
        subject_name: classItem.subject_name,
        description:  classItem.description,
        monthly_fee:  classItem.monthly_fee,
      });
    }
  }, [classItem, open, reset]);

  async function onSubmit(data) {
    setIsLoading(true);
    try {
      toast.success('Class updated successfully');
      onOpenChange(false);
      onSave({ ...classItem, ...data });
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
          <Field label="Display Name" required id="display_name" error={errors.display_name?.message}>
            <Input
              id="display_name"
              placeholder="e.g. 2026 A/L English Medium"
              aria-invalid={!!errors.display_name}
              {...register('display_name')}
            />
          </Field>

          <Field label="Subject Name" required id="subject_name" error={errors.subject_name?.message}>
            <Input
              id="subject_name"
              placeholder="e.g. Combined Mathematics"
              aria-invalid={!!errors.subject_name}
              {...register('subject_name')}
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

          <Field label="Monthly Fee (LKR)" required id="monthly_fee" error={errors.monthly_fee?.message}>
            <Input
              id="monthly_fee"
              type="number"
              min="0"
              placeholder="e.g. 3500"
              aria-invalid={!!errors.monthly_fee}
              {...register('monthly_fee')}
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
