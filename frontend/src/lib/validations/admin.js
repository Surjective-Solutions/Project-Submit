import { z } from 'zod';

const usernameSchema = z
  .string()
  .min(4, 'Username must be at least 4 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/\d/, 'Must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character');

const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Enter a valid email address');

const sriLankaPhone = z
  .string()
  .min(1, 'Contact number is required')
  .regex(/^\+94\d{9}$/, 'Enter a valid Sri Lanka number (+94XXXXXXXXX)');

export const adminLoginSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1, 'Password is required'),
});

export const cashierLoginSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1, 'Password is required'),
});

export const teacherLoginSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1, 'Password is required'),
});

export const createTutorSchema = z
  .object({
    displayName: z.string().min(1, 'Display name is required'),
    email: emailSchema,
    contactNumber: sriLankaPhone,
    subject: z.string().min(1, 'Subject is required'),
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const editTutorSchema = z
  .object({
    displayName: z.string().min(1, 'Display name is required'),
    email: emailSchema,
    contactNumber: sriLankaPhone,
    subject: z.string().min(1, 'Subject is required'),
    newUsername: z
      .string()
      .refine((v) => v === '' || /^[a-zA-Z0-9_]{4,}$/.test(v), {
        message: 'Username must be at least 4 chars, alphanumeric + underscore only',
      })
      .optional()
      .or(z.literal('')),
    newPassword: z
      .string()
      .refine(
        (v) =>
          v === '' ||
          (v.length >= 8 &&
            /[A-Z]/.test(v) &&
            /\d/.test(v) &&
            /[^A-Za-z0-9]/.test(v)),
        { message: 'Password must be 8+ chars with uppercase, number, and special character' }
      )
      .optional()
      .or(z.literal('')),
    confirmNewPassword: z.string().optional().or(z.literal('')),
  })
  .refine(
    (d) => {
      if (d.newPassword && d.newPassword !== '') {
        return d.confirmNewPassword === d.newPassword;
      }
      return true;
    },
    { message: 'Passwords do not match', path: ['confirmNewPassword'] }
  );

export const createCashierSchema = z
  .object({
    fullName: z.string().min(1, 'Full name is required'),
    email: emailSchema,
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const studentEditSchema = z
  .object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    contact_number: sriLankaPhone,
    whatsapp_number: z
      .string()
      .refine((v) => v === '' || /^\+94\d{9}$/.test(v), 'Enter a valid Sri Lanka number (+94XXXXXXXXX)')
      .optional()
      .or(z.literal('')),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    date_of_birth: z.string().optional().or(z.literal('')),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    school_name: z.string().optional().or(z.literal('')),
    grade: z.string().optional().or(z.literal('')),
    subject_stream: z.string().optional().or(z.literal('')),
    district: z.string().optional().or(z.literal('')),
    guardian_name: z.string().optional().or(z.literal('')),
    guardian_contact: z.string().optional().or(z.literal('')),
    address: z.string().optional().or(z.literal('')),
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'GRADUATED']),
    new_password: z
      .string()
      .refine((v) => !v || v.length >= 8, 'Password must be at least 8 characters')
      .optional()
      .or(z.literal('')),
    confirm_password: z.string().optional().or(z.literal('')),
  })
  .refine(
    (d) => {
      if (d.new_password && d.new_password !== '') {
        return d.confirm_password === d.new_password;
      }
      return true;
    },
    { message: 'Passwords do not match', path: ['confirm_password'] }
  );

export const adminInstructorEditSchema = z
  .object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    employee_id: z.string().min(1, 'Employee ID is required'),
    subject_area: z.string().min(1, 'Subject area is required'),
    contact_number: sriLankaPhone,
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    status: z.enum(['ACTIVE', 'INACTIVE']),
    new_password: z
      .string()
      .refine((v) => !v || v.length >= 8, 'Password must be at least 8 characters')
      .optional()
      .or(z.literal('')),
    confirm_password: z.string().optional().or(z.literal('')),
  })
  .refine(
    (d) => {
      if (d.new_password && d.new_password !== '') {
        return d.confirm_password === d.new_password;
      }
      return true;
    },
    { message: 'Passwords do not match', path: ['confirm_password'] }
  );

export const studentCreateSchema = z
  .object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    contact_number: sriLankaPhone,
    whatsapp_number: z
      .string()
      .refine((v) => v === '' || /^\+94\d{9}$/.test(v), 'Enter a valid Sri Lanka number (+94XXXXXXXXX)')
      .optional()
      .or(z.literal('')),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    date_of_birth: z.string().optional().or(z.literal('')),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    school_name: z.string().optional().or(z.literal('')),
    grade: z.string().optional().or(z.literal('')),
    subject_stream: z.string().optional().or(z.literal('')),
    district: z.string().optional().or(z.literal('')),
    guardian_name: z.string().optional().or(z.literal('')),
    guardian_contact: z.string().optional().or(z.literal('')),
    address: z.string().optional().or(z.literal('')),
    password: passwordSchema,
    confirm_password: z.string().min(1, 'Please confirm password'),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

export const paymentApprovalSchema = z.object({
  reference_number: z.string().min(1, 'Reference number is required'),
});

export const paymentRejectionSchema = z.object({
  rejection_reason: z.string().min(10, 'Reason must be at least 10 characters'),
});

export const editCashierSchema = z
  .object({
    fullName: z.string().min(1, 'Full name is required'),
    email: emailSchema,
    newUsername: z
      .string()
      .refine((v) => v === '' || /^[a-zA-Z0-9_]{4,}$/.test(v), {
        message: 'Username must be at least 4 chars, alphanumeric + underscore only',
      })
      .optional()
      .or(z.literal('')),
    newPassword: z
      .string()
      .refine(
        (v) =>
          v === '' ||
          (v.length >= 8 &&
            /[A-Z]/.test(v) &&
            /\d/.test(v) &&
            /[^A-Za-z0-9]/.test(v)),
        { message: 'Password must be 8+ chars with uppercase, number, and special character' }
      )
      .optional()
      .or(z.literal('')),
    confirmNewPassword: z.string().optional().or(z.literal('')),
  })
  .refine(
    (d) => {
      if (d.newPassword && d.newPassword !== '') {
        return d.confirmNewPassword === d.newPassword;
      }
      return true;
    },
    { message: 'Passwords do not match', path: ['confirmNewPassword'] }
  );
