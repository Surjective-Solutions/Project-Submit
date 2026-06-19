import { z } from 'zod';

// Old format: 9 digits + V or X; New format: 12 digits
const nicSchema = z
  .string()
  .min(1, 'NIC number is required')
  .regex(/^(\d{9}[VXvx]|\d{12})$/, 'Enter a valid NIC number (e.g. 123456789V or 200012345678)');

const sriLankaPhone = z
  .string()
  .min(1, 'Phone number is required')
  .regex(/^\+94\d{9}$/, 'Enter a valid Sri Lanka phone number (+94XXXXXXXXX)');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/\d/, 'Must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character');

export const instructorLoginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const instructorRegisterSchema = z
  .object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    contactNumber: sriLankaPhone,
    nicNumber: nicSchema,
    address: z.string().min(1, 'Address is required'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    termsAccepted: z
      .boolean()
      .refine((v) => v === true, 'You must accept the Terms of Service and Privacy Policy'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const instructorProfileSchema = z
  .object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    contact_number: sriLankaPhone,
    subject_area: z.string().min(1, 'Subject area is required'),
    employee_id: z.string().min(1, 'Employee ID is required'),
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
