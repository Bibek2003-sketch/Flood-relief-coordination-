import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    firstName: z.string({ required_error: 'First name is required' }).min(2, 'First name must be at least 2 characters'),
    lastName: z.string({ required_error: 'Last name is required' }).min(2, 'Last name must be at least 2 characters'),
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
    roleName: z.string().optional(),
    contactNumber: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    password: z.string({ required_error: 'Password is required' }),
  }),
});
