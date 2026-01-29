'use server';

import { revalidatePath } from 'next/cache';

import { createTaskUseCase } from '@/lib/features/tasks/use-cases/createTask';
import { TaskFormState } from '@/lib/features/tasks/types';

export async function createTask(
  prevState: TaskFormState | null,
  formData: FormData,
): Promise<TaskFormState> {
  const result = await createTaskUseCase(formData);

  if (result.ok) {
    revalidatePath('/');
    revalidatePath('/tasks');
  }

  return result;
}
