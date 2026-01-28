import { createTaskSchema, type CreateTaskInput } from '../schema';
import type { TaskFormState } from '../types';

import { Task } from '@/lib/db/entities/Task';
import { getOrm } from '@/lib/db/mikro-orm';
import { formDataToObject, zodFieldErrors } from '@/lib/validation/forms';

const initialValues: Partial<CreateTaskInput> = {
  title: '',
  description: null,
  tags: [],
};

export async function createTaskUseCase(
  formData: FormData,
): Promise<TaskFormState> {
  const raw = formDataToObject(formData);
  const parsed = createTaskSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      formError: 'Please fix the errors below.',
      fieldErrors: zodFieldErrors(parsed.error) as TaskFormState['fieldErrors'],
      values: {
        ...initialValues,
        title: raw.title ?? '',
        description: raw.description ?? null,
      },
    };
  }

  // Persist to database
  try {
    const orm = await getOrm();
    const em = orm.em.fork();

    const task = new Task({
      title: parsed.data.title,
      description: parsed.data.description,
      intensity: parsed.data.intensity,
      dueAt: parsed.data.dueAt,
      tags: parsed.data.tags,
    });

    await em.persist(task).flush();

    return {
      ok: true,
      message: 'Task created successfully',
      taskId: task.id,
    };
  } catch (error) {
    console.error('Failed to create task:', error);
    return {
      ok: false,
      formError: 'Failed to create task. Please try again.',
      values: parsed.data,
    };
  }
}
