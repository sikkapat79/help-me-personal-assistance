'use server';

import { revalidatePath } from 'next/cache';

import { updateTaskUseCase } from '@/lib/features/tasks/use-cases/updateTask';
import type { TaskFormState } from '@/lib/features/tasks/types';

export async function updateTask(
  prevState: TaskFormState | null,
  formData: FormData,
): Promise<TaskFormState> {
  const result = await updateTaskUseCase(formData);

  if (result.ok) {
    revalidatePath('/');
    revalidatePath('/tasks');
  }

  return result;
}
