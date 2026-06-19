import { z } from 'zod';

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

const dateOfBirth = z
  .string()
  .min(1, 'Date of birth is required')
  .refine((val) => {
    const date = new Date(val);
    if (isNaN(date.getTime())) return false;
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 10);
    return date <= cutoff;
  }, 'Must be at least 10 years old');

export const studentLoginSchema = z.object({
  identifier: z.string().min(1, 'Email or contact number is required'),
  password: z.string().min(1, 'Password is required'),
});

export const studentStep1Schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  contactNumber: sriLankaPhone,
  dateOfBirth,
  gender: z.enum(['Male', 'Female', 'Prefer not to say'], {
    error: 'Please select a gender',
  }),
  guardianName: z.string().min(1, 'Guardian name is required'),
  guardianContactNumber: sriLankaPhone,
  address: z.string().min(1, 'Address is required'),
  // Optional fields
  email: z
    .string()
    .refine((v) => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Invalid email address')
    .optional()
    .or(z.literal('')),
  whatsappNumber: z.string().optional(),
  schoolName: z.string().optional(),
  grade: z.string().optional(),
  subjectStream: z
    .enum(['Maths', 'Bio', 'Commerce', 'Arts', 'Technology'])
    .optional()
    .or(z.literal('')),
  district: z.string().optional(),
  profilePhoto: z.any().optional(),
});

export const studentStep2Schema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    marketingConsent: z.boolean().optional(),
    termsAccepted: z
      .boolean()
      .refine((v) => v === true, 'You must accept the Terms of Service and Privacy Policy'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const SRI_LANKA_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle',
  'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle',
  'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale', 'Matara', 'Monaragala',
  'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura',
  'Trincomalee', 'Vavuniya',
];
