import { z } from 'zod';

export enum MorningMood {
  Fresh = 'Fresh',
  Tired = 'Tired',
  Taxed = 'Taxed',
}

// Schema for submitting a morning check-in
export const submitCheckInSchema = z.object({
  checkInDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  restQuality1to10: z.coerce
    .number()
    .int()
    .min(1, 'Sleeping quality must be at least 1')
    .max(10, 'Sleeping quality must be at most 10'),
  morningMood: z.nativeEnum(MorningMood, { message: 'Invalid morning mood' }),
});

export type SubmitCheckInInput = z.infer<typeof submitCheckInSchema>;
