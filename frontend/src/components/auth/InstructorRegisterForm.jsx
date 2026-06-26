'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import PasswordStrength from './PasswordStrength';
import { instructorRegisterSchema } from '@/lib/validations/instructor';
import { instructorRegister, resendOtp } from "@/lib/api-client";

function Field({ label, required, error, id, children }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <Label htmlFor={id} className={error ? "text-destructive" : ""}>
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
      )}
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
        value={value?.replace(/^\+94/, "") ?? ""}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
          onChange(digits ? `+94${digits}` : "");
        }}
        onBlur={onBlur}
        className="rounded-l-none"
      />
    </div>
  );
}

export default function InstructorRegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(instructorRegisterSchema),
    defaultValues: {
      fullName: "",
      email: "",
      contactNumber: "",
      nicNumber: "",
      address: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  });

  const passwordValue = watch("password", "");

  async function onSubmit(data) {
    setIsLoading(true);
    try {
      const response = await instructorRegister(data);
      const identifier = response.instructorSeq;
      await resendOtp(identifier);
      sessionStorage.setItem("otp_identifier", identifier);
      // router.push("/instructor/verify-otp");
      router.push(
        `/instructor/verify-otp?identifier=${encodeURIComponent(identifier)}`,
      );
    } catch {
      toast.error("Submission failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {/* Full name */}
      <Field
        label="Full Name"
        required
        id="fullName"
        error={errors.fullName?.message}
      >
        <Input
          id="fullName"
          autoComplete="name"
          placeholder="Dr. Jane Smith"
          aria-invalid={!!errors.fullName}
          {...register("fullName")}
        />
      </Field>

      {/* Email */}
      <Field label="Email" required id="email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="name@school.edu"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
      </Field>

      {/* Contact */}
      <Field
        label="Contact Number"
        required
        id="contactNumber"
        error={errors.contactNumber?.message}
      >
        <Controller
          control={control}
          name="contactNumber"
          render={({ field }) => (
            <PhoneInput
              id="contactNumber"
              error={errors.contactNumber}
              {...field}
            />
          )}
        />
      </Field>

      {/* NIC */}
      <Field
        label="NIC Number"
        required
        id="nicNumber"
        error={errors.nicNumber?.message}
      >
        <Input
          id="nicNumber"
          placeholder="123456789V or 200012345678"
          aria-invalid={!!errors.nicNumber}
          {...register("nicNumber")}
        />
      </Field>

      {/* Address */}
      <Field
        label="Address"
        required
        id="address"
        error={errors.address?.message}
      >
        <Input
          id="address"
          autoComplete="street-address"
          aria-invalid={!!errors.address}
          {...register("address")}
        />
      </Field>

      {/* Password */}
      <Field
        label="Password"
        required
        id="password"
        error={errors.password?.message}
      >
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Create a strong password"
            aria-invalid={!!errors.password}
            className="pr-10"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <PasswordStrength value={passwordValue} />
      </Field>

      {/* Confirm password */}
      <Field
        label="Confirm Password"
        required
        id="confirmPassword"
        error={errors.confirmPassword?.message}
      >
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repeat your password"
            aria-invalid={!!errors.confirmPassword}
            className="pr-10"
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            aria-label={showConfirm ? "Hide password" : "Show password"}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
          >
            {showConfirm ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </Field>

      {/* Terms */}
      <div className="space-y-1.5">
        <Controller
          control={control}
          name="termsAccepted"
          render={({ field }) => (
            <div className="flex items-start gap-2.5">
              <Checkbox
                id="termsAccepted"
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-invalid={!!errors.termsAccepted}
                className="mt-0.5"
              />
              <Label
                htmlFor="termsAccepted"
                className="text-sm text-gray-700 font-normal leading-relaxed cursor-pointer"
              >
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="underline text-gray-900 font-medium"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="underline text-gray-900 font-medium"
                >
                  Privacy Policy
                </Link>
              </Label>
            </div>
          )}
        />
        {errors.termsAccepted && (
          <p className="text-xs text-destructive pl-7" role="alert">
            {errors.termsAccepted.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full h-9 bg-[#0f172a] text-white hover:bg-[#1e293b]"
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Submit Application
      </Button>

      {/* Login link */}
      <p className="text-center text-xs text-gray-400">
        Already have an account?{" "}
        <Link
          href="/instructor/login"
          className="text-gray-500 hover:underline font-medium"
        >
          Login
        </Link>
      </p>
    </form>
  );
}
