import { z } from 'zod';

export const FlowStatusSchema = z.enum([
  'period',
  'spotting',
  'no_period',
  'missed_or_late',
  'unknown'
]);

export const DailyLogSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1, 'User ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  colorHex: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Invalid hex color code').optional().or(z.literal('')),
  flowStatus: FlowStatusSchema,
  cramps: z.number().min(0).max(10).optional(),
  backPain: z.number().min(0).max(2).optional(),
  headache: z.number().min(0).max(3).optional(),
  bloating: z.number().min(0).max(3).optional(),
  nausea: z.number().min(0).max(3).optional(),
  fatigue: z.number().min(0).max(3).optional(),
  mood: z.number().min(1).max(5).optional(),
  cravings: z.number().min(0).max(3).optional(),
  sleepQuality: z.number().min(1).max(5).optional(),
  selfCareActions: z.array(z.string()).default([]),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
});

export const OrderCheckoutSchema = z.object({
  addressLabel: z.string().min(3, 'Address label or apartment name is required').max(100),
  discreetPackaging: z.boolean().default(true),
  verifiedPartnerPreference: z.boolean().default(true),
  pharmacistConsentAcknowledged: z.boolean().refine(val => val === true, {
    message: 'You must acknowledge the pharmacist guidance requirement for comfort medications',
  }).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters for demo'),
});

export const RegisterSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['user', 'delivery_partner', 'admin']).default('user'),
  averageCycleDays: z.number().min(20).max(45).default(28),
});
