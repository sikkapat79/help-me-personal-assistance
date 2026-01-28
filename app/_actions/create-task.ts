'use server';

import { createTaskUseCase } from '@/lib/features/tasks/use-cases/createTask';
import { TaskFormState } from '@/lib/features/tasks/types';

export async function createTask(
  prevState: TaskFormState | null,
  formData: FormData,
): Promise<TaskFormState> {
  return createTaskUseCase(formData);
}
