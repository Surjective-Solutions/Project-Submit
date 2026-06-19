import { z } from 'zod';

const sriLankaPhone = z
  .string()
  .min(1, 'Phone number is required')
  .regex(/^\+94\d{9}$/, 'Enter a valid Sri Lanka phone number (+94XXXXXXXXX)');

export const teacherProfileSchema = z
  .object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    contact_number: sriLankaPhone,
    subject_area: z.string().min(1, 'Subject area is required'),
    bio: z.string().optional().or(z.literal('')),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .regex(/^[A-Za-z0-9.]+$/, 'Only letters, numbers, and dots allowed'),
    new_password: z
      .string()
      .refine(
        (v) =>
          !v ||
          (v.length >= 8 &&
            /[A-Z]/.test(v) &&
            /\d/.test(v) &&
            /[^A-Za-z0-9]/.test(v)),
        'Password must be 8+ chars with uppercase, number, and special character'
      )
      .optional()
      .or(z.literal('')),
    confirm_password: z.string().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.new_password && data.new_password !== '') {
        return data.confirm_password === data.new_password;
      }
      return true;
    },
    { message: 'Passwords do not match', path: ['confirm_password'] }
  );

export const teacherClassSchema = z.object({
  display_name: z.string().min(1, 'Display name is required'),
  subject_name: z.string().min(1, 'Subject name is required'),
  description: z.string().min(1, 'Description is required'),
  monthly_fee: z.coerce.number({ invalid_type_error: 'Fee must be a number' }).positive('Fee must be a positive number'),
});

export const instructorSchema = z.object({
  employee_id: z.string().min(3, 'Employee ID must be at least 3 characters'),
});

export const paperUploadSchema = z.object({
  paper_name: z.string().min(3, 'Paper name must be at least 3 characters'),
  month: z.coerce.number().int().min(1, 'Month is required').max(12, 'Invalid month'),
  year: z.coerce.number().int().min(2020, 'Year must be 2020 or later').max(2030, 'Year must be 2030 or earlier'),
  number_of_questions: z.coerce.number().int().min(1, 'At least 1 question required').max(100, 'Max 100 questions'),
  pdf_file: z.any().refine((val) => val && val.length > 0, 'Please select a PDF file'),
  status: z.enum(['DRAFT', 'PUBLISHED']),
});

export const paperEditSchema = z.object({
  paper_name: z.string().min(3, 'Paper name must be at least 3 characters'),
  month: z.coerce.number().int().min(1, 'Month is required').max(12, 'Invalid month'),
  year: z.coerce.number().int().min(2020, 'Year must be 2020 or later').max(2030, 'Year must be 2030 or earlier'),
  number_of_questions: z.coerce.number().int().min(1, 'At least 1 question required').max(100, 'Max 100 questions'),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  pdf_file: z.any().optional(),
});
