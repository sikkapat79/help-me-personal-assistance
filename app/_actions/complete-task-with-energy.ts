'use server';

import { revalidatePath } from 'next/cache';
import {
  completeTaskWithEnergySchema,
  type MorningMood,
} from '@/lib/features/checkin/schema';
import { completeTaskWithEnergyFeedback } from '@/lib/features/tasks/use-cases/completeTaskWithEnergyFeedback';
import { Result } from '@/lib/result';
import { AppError } from '@/lib/errors';

export async function completeTaskWithEnergyAction(
  taskId: string,
  capacityStateAfter: MorningMood,
): Promise<Result<{ success: boolean; energyNotTracked?: boolean }, AppError>> {
  const parsed = completeTaskWithEnergySchema.safeParse({
    taskId,
    capacityStateAfter,
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: new AppError('VALIDATION_ERROR', 'Invalid input', {
        cause: parsed.error.flatten().fieldErrors,
      }),
    };
  }

  const result = await completeTaskWithEnergyFeedback(
    parsed.data.taskId,
    parsed.data.capacityStateAfter,
  );

  if (!result.ok) {
    return result;
  }

  revalidatePath('/');

  return {
    ok: true,
    data: {
      success: true,
      energyNotTracked: result.data.energyNotTracked,
    },
  };
}
