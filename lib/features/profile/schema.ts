import { z } from 'zod';

import { zOptionalStringToNull } from '@/lib/validation/strings';

// TypeScript enum for primary focus period
export enum PrimaryFocusPeriod {
  Morning = 'Morning',
  Noon = 'Noon',
}

// Zod schema for creating a user profile
export const createUserProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, 'Display name is required')
    .max(100, 'Display name is too long'),
  role: z
    .string()
    .trim()
    .min(1, 'Role is required')
    .max(100, 'Role is too long'),
  bio: zOptionalStringToNull().transform((val: string | null) => val ?? null),
  workingStartMinutes: z
    .number()
    .int()
    .min(0, 'Working start must be between 0 and 1439')
    .max(1439, 'Working start must be between 0 and 1439'),
  workingEndMinutes: z
    .number()
    .int()
    .min(0, 'Working end must be between 0 and 1439')
    .max(1439, 'Working end must be between 0 and 1439'),
  primaryFocusPeriod: z.nativeEnum(PrimaryFocusPeriod),
  timeZone: z
    .string()
    .trim()
    .min(1, 'Time zone is required')
    .max(64, 'Time zone is too long')
    .default('UTC'),
  morningPokeTimeMinutes: z.coerce
    .number()
    .int()
    .min(0, 'Morning poke time must be between 0 and 1439')
    .max(1439, 'Morning poke time must be between 0 and 1439')
    .default(480),
});

// Zod schema for updating a user profile
export const updateUserProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, 'Display name is required')
    .max(100, 'Display name is too long')
    .optional(),
  role: z
    .string()
    .trim()
    .min(1, 'Role is required')
    .max(100, 'Role is too long')
    .optional(),
  bio: zOptionalStringToNull()
    .transform((val: string | null) => val ?? null)
    .optional(),
  workingStartMinutes: z
    .number()
    .int()
    .min(0, 'Working start must be between 0 and 1439')
    .max(1439, 'Working start must be between 0 and 1439')
    .optional(),
  workingEndMinutes: z
    .number()
    .int()
    .min(0, 'Working end must be between 0 and 1439')
    .max(1439, 'Working end must be between 0 and 1439')
    .optional(),
  primaryFocusPeriod: z.nativeEnum(PrimaryFocusPeriod).optional(),
  timeZone: z
    .string()
    .trim()
    .min(1, 'Time zone is required')
    .max(64, 'Time zone is too long')
    .optional(),
  morningPokeTimeMinutes: z.coerce
    .number()
    .int()
    .min(0, 'Morning poke time must be between 0 and 1439')
    .max(1439, 'Morning poke time must be between 0 and 1439')
    .optional(),
});

export type CreateUserProfileInput = z.infer<typeof createUserProfileSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
