'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Wallet } from 'lucide-react';
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
import { createCashierSchema } from '@/lib/validations/admin';
import { createCashier } from '@/lib/api-client';

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

export default function AddCashierDialog({ open, onOpenChange, onSuccess }) {
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
    } catch {
      toast.error('Failed to create cashier. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        {/* Coloured header strip */}
        <div
          className="px-6 py-5 flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg, #053A34 0%, #0d6b5e 100%)' }}
        >
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <div>
            <DialogTitle className="text-white text-base font-semibold leading-tight m-0">
              Add New Cashier
            </DialogTitle>
            <DialogDescription className="text-white/60 text-xs mt-0.5 m-0">
              Create a cashier account for payment desk staff.
            </DialogDescription>
          </div>
        </div>

        {/* Form body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto"
        >
          {/* Row 1: Full Name + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          <Separator />

          {/* Username */}
          <Field label="Username" required id="username" error={errors.username?.message}>
            <Input
              id="username"
              placeholder="cashier_username"
              autoComplete="off"
              aria-invalid={!!errors.username}
              {...register('username')}
            />
          </Field>

          {/* Password + Confirm */}
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
              className="min-w-[140px] text-white"
              style={{ background: 'linear-gradient(135deg, #053A34 0%, #0d6b5e 100%)' }}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Create Cashier
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
