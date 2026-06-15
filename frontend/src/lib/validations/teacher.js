import { z } from 'zod';

export const teacherClassSchema = z.object({
  title: z.string().min(1, 'Class title is required'),
  description: z.string().min(1, 'Description is required'),
  subject: z.string().min(1, 'Subject is required'),
  grade: z.string().min(1, 'Grade is required'),
  fee: z.coerce.number({ invalid_type_error: 'Fee must be a number' }).positive('Fee must be a positive number'),
});

export const instructorSchema = z.object({
  employee_id: z.string().min(3, 'Employee ID must be at least 3 characters'),
});
