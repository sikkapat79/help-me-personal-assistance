import { z } from 'zod';

export enum MorningMood {
  Fresh = 'Fresh',
  Neutral = 'Neutral',
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
  sleepNotes: z
    .string()
    .max(2000)
    .optional()
    .transform((s) =>
      s === undefined || s?.trim() === '' ? undefined : s?.trim(),
    ),
});

export type SubmitCheckInInput = z.infer<typeof submitCheckInSchema>;

/** Capacity state after completing a task (same as MorningMood). */
export type CapacityStateAfter = MorningMood;

/** Schema for complete-task-with-energy server action. */
export const completeTaskWithEnergySchema = z.object({
  taskId: z.string().uuid('Invalid task ID'),
  capacityStateAfter: z.nativeEnum(MorningMood, {
    message: 'Invalid capacity state',
  }),
});

export type CompleteTaskWithEnergyInput = z.infer<
  typeof completeTaskWithEnergySchema
>;
