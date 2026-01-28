'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { TaskStatus } from '@/lib/features/tasks/schema';
import { updateTaskStatus } from '@/lib/features/tasks/use-cases/updateTaskStatus';
import { Result } from '@/lib/result';
import { AppError } from '@/lib/errors';

const updateTaskStatusSchema = z.object({
  taskId: z.uuid('Invalid task ID'),
  status: z.enum(TaskStatus),
});

export async function updateTaskStatusAction(
  taskId: string,
  status: TaskStatus,
): Promise<Result<{ success: boolean }, AppError>> {
  const parsed = updateTaskStatusSchema.safeParse({ taskId, status });

  if (!parsed.success) {
    return {
      ok: false,
      error: new AppError('VALIDATION_ERROR', 'Invalid input', {
        cause: parsed.error.flatten().fieldErrors,
      }),
    };
  }

  const result = await updateTaskStatus(taskId, status);

  if (!result.ok) {
    return result;
  }

  // Revalidate the home page to refresh the task list
  revalidatePath('/');

  return {
    ok: true,
    data: { success: true },
  };
}
