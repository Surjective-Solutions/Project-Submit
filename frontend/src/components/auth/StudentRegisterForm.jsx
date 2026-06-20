'use client';

import { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, ChevronUp, Eye, EyeOff, Loader2, Upload, UserCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import PasswordStrength from './PasswordStrength';
import { studentStep1Schema, studentStep2Schema, SRI_LANKA_DISTRICTS } from '@/lib/validations/student';
import { studentRegister } from '@/lib/api-client';
import { redirect } from "next/dist/server/api-utils";
import { navigate } from "next/dist/client/components/segment-cache/navigation";

// ─── Field wrapper ────────────────────────────────────────────────────────────

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

// ─── Phone input with prefix ──────────────────────────────────────────────────

function PhoneInput({ id, error, value, onChange, onBlur, name }) {
  return (
    <div className="flex">
      <span className="inline-flex items-center rounded-l-lg border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground select-none">
        +94
      </span>
      <Input
        id={id}
        name={name}
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

// ─── Step 1 ───────────────────────────────────────────────────────────────────

function Step1({ onNext }) {
  const [extraOpen, setExtraOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(studentStep1Schema),
    defaultValues: {
      gender: "",
      subjectStream: "",
      district: "",
      contactNumber: "",
      guardianContactNumber: "",
    },
  });

  function onSubmit(data) {
    onNext(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="First Name"
          required
          id="firstName"
          error={errors.firstName?.message}
        >
          <Input
            id="firstName"
            autoComplete="given-name"
            aria-invalid={!!errors.firstName}
            {...register("firstName")}
          />
        </Field>
        <Field
          label="Last Name"
          required
          id="lastName"
          error={errors.lastName?.message}
        >
          <Input
            id="lastName"
            autoComplete="family-name"
            aria-invalid={!!errors.lastName}
            {...register("lastName")}
          />
        </Field>
      </div>

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

      <Field
        label="Date of Birth"
        required
        id="dateOfBirth"
        error={errors.dateOfBirth?.message}
      >
        <Input
          id="dateOfBirth"
          type="date"
          aria-invalid={!!errors.dateOfBirth}
          {...register("dateOfBirth")}
        />
      </Field>

      <Field label="Gender" required id="gender" error={errors.gender?.message}>
        <Controller
          control={control}
          name="gender"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                id="gender"
                className="w-full"
                aria-invalid={!!errors.gender}
              >
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Prefer not to say">
                  Prefer not to say
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </Field>

      <Field
        label="Guardian Name"
        required
        id="guardianName"
        error={errors.guardianName?.message}
      >
        <Input
          id="guardianName"
          aria-invalid={!!errors.guardianName}
          {...register("guardianName")}
        />
      </Field>

      <Field
        label="Guardian Contact Number"
        required
        id="guardianContactNumber"
        error={errors.guardianContactNumber?.message}
      >
        <Controller
          control={control}
          name="guardianContactNumber"
          render={({ field }) => (
            <PhoneInput
              id="guardianContactNumber"
              error={errors.guardianContactNumber}
              {...field}
            />
          )}
        />
      </Field>

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

      {/* Additional Information (collapsible) */}
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setExtraOpen((v) => !v)}
          aria-expanded={extraOpen}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Additional Information
          {extraOpen ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </button>

        {extraOpen && (
          <div className="px-4 pb-4 pt-1 space-y-4 border-t border-gray-100">
            <Field label="Email" id="email" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              <p className="text-xs text-gray-400">
                Recommended for notifications
              </p>
            </Field>

            <Field
              label="WhatsApp Number"
              id="whatsappNumber"
              error={errors.whatsappNumber?.message}
            >
              <Input
                id="whatsappNumber"
                type="tel"
                placeholder="+94XXXXXXXXX"
                {...register("whatsappNumber")}
              />
            </Field>

            <Field
              label="School Name"
              id="schoolName"
              error={errors.schoolName?.message}
            >
              <Input id="schoolName" {...register("schoolName")} />
            </Field>

            <Field label="Grade" id="grade" error={errors.grade?.message}>
              <Input
                id="grade"
                placeholder="e.g. Grade 12"
                {...register("grade")}
              />
            </Field>

            <Field
              label="Subject Stream"
              id="subjectStream"
              error={errors.subjectStream?.message}
            >
              <Controller
                control={control}
                name="subjectStream"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="subjectStream" className="w-full">
                      <SelectValue placeholder="Select stream" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Maths", "Bio", "Commerce", "Arts", "Technology"].map(
                        (s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field
              label="District"
              id="district"
              error={errors.district?.message}
            >
              <Controller
                control={control}
                name="district"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="district" className="w-full">
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {SRI_LANKA_DISTRICTS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            {/* Profile photo upload */}
            <div className="space-y-2">
              <Label>Profile Photo</Label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircle className="w-10 h-10 text-gray-300" />
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  aria-label="Upload profile photo"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setPreview(URL.createObjectURL(file));
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Button
        type="submit"
        className="w-full h-9 bg-[#0f172a] text-white hover:bg-[#1e293b]"
      >
        Next — Account Setup
      </Button>
    </form>
  );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────

function Step2({ onBack, step1Data }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(studentStep2Schema),
    defaultValues: {
      marketingConsent: false,
      termsAccepted: false,
    },
  });

  const passwordValue = watch("password", "");

  async function onSubmit(data) {
    setIsLoading(true);
    try {
      const payload = { ...step1Data, ...data };
      const result = await studentRegister(payload);
      toast.success(
        result.message ?? "Account created! Please verify your number.",
      );
    } catch {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
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
            placeholder="Create a password"
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

      {/* Marketing consent */}
      <div className="space-y-1.5">
        <Controller
          control={control}
          name="marketingConsent"
          render={({ field }) => (
            <div className="flex items-start gap-2.5">
              <Checkbox
                id="marketingConsent"
                checked={field.value}
                onCheckedChange={field.onChange}
                className="mt-0.5"
              />
              <Label
                htmlFor="marketingConsent"
                className="text-sm text-gray-500 font-normal leading-relaxed cursor-pointer"
              >
                I agree to receive promotional materials, updates and offers via
                SMS, WhatsApp and email.
              </Label>
            </div>
          )}
        />
      </div>

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

      <div className="flex gap-3 pt-1">
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-9"
          onClick={onBack}
          disabled={isLoading}
        >
          Back
        </Button>
        <Button
          type="submit"
          className="flex-1 h-9 bg-[#0f172a] text-white hover:bg-[#1e293b]"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Create Account
        </Button>
      </div>

      <p className="text-center text-xs text-gray-400 pt-1">
        Are you an instructor?{" "}
        <Link
          href="/instructor/register"
          className="text-gray-500 hover:underline"
        >
          Register here
        </Link>
      </p>
    </form>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function StudentRegisterForm() {
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState(null);

  function handleStep1Next(data) {
    setStep1Data(data);
    setStep(2);
  }

  return (
    <div>
      <p className="text-xs text-gray-400 mb-4">Step {step} of 2</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        {step === 1 ? 'Personal Information' : 'Account Setup'}
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        {step === 1
          ? 'Tell us about yourself to get started'
          : 'Set a secure password for your account'}
      </p>

      {step === 1 ? (
        <Step1 onNext={handleStep1Next} />
      ) : (
        <Step2 onBack={() => setStep(1)} step1Data={step1Data} />
      )}
    </div>
  );
}
