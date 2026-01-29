'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { deleteTask } from '@/lib/features/tasks/use-cases/deleteTask';
import { Result } from '@/lib/result';
import { AppError } from '@/lib/errors';

const deleteTaskSchema = z.object({
  taskId: z.uuid('Invalid task ID'),
});

export async function deleteTaskAction(
  taskId: string,
): Promise<Result<{ success: boolean }, AppError>> {
  const parsed = deleteTaskSchema.safeParse({ taskId });

  if (!parsed.success) {
    return {
      ok: false,
      error: new AppError('VALIDATION_ERROR', 'Invalid input', {
        cause: parsed.error.flatten().fieldErrors,
      }),
    };
  }

  const result = await deleteTask(parsed.data.taskId);

  if (!result.ok) {
    return result;
  }

  revalidatePath('/');
  revalidatePath('/tasks');

  return {
    ok: true,
    data: { success: true },
  };
}
