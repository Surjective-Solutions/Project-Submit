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
import { instructorSchema } from '@/lib/validations/teacher';
import { updateInstructor } from '@/lib/api-client';

export default function EditInstructorDialog({ open, onOpenChange, instructor, onSave }) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(instructorSchema),
  });

  useEffect(() => {
    if (instructor && open) {
      reset({ employee_id: instructor.employee_id });
    }
  }, [instructor, open, reset]);

  async function onSubmit(data) {
    setIsLoading(true);
    try {
      await updateInstructor(instructor.id, data);
      toast.success('Instructor updated successfully');
      onOpenChange(false);
      onSave({ ...instructor, ...data });
    } catch {
      toast.error('Failed to update instructor. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg, #053A34 0%, #0d6b5e 100%)' }}
        >
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <Pencil className="h-5 w-5 text-white" />
          </div>
          <div>
            <DialogTitle className="text-white text-base font-semibold leading-tight m-0">
              Edit Instructor
            </DialogTitle>
            <DialogDescription className="text-white/60 text-xs mt-0.5 m-0">
              Update instructor details.
            </DialogDescription>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-6 py-5 space-y-5">
          <div className="space-y-1.5">
            <Label
              htmlFor="employee_id"
              className={errors.employee_id ? 'text-destructive' : 'text-gray-700'}
            >
              Employee ID
              <span className="text-destructive ml-0.5">*</span>
            </Label>
            <Input
              id="employee_id"
              placeholder="e.g. EMP-001"
              aria-invalid={!!errors.employee_id}
              {...register('employee_id')}
            />
            {errors.employee_id && (
              <p className="text-xs text-destructive" role="alert">
                {errors.employee_id.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="text-white"
              style={{ background: 'linear-gradient(135deg, #053A34 0%, #0d6b5e 100%)' }}
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
