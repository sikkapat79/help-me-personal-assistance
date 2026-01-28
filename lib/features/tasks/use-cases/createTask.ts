import { createTaskSchema, type CreateTaskInput } from '../schema';
import type { TaskFormState } from '../types';

import { Task } from '@/lib/db/entities/Task';
import { getRepository } from '@/lib/db/connection';
import { formDataToObject, zodFieldErrors } from '@/lib/validation/forms';
import { requireActiveProfileId } from '@/lib/features/profile/activeProfile';
import { getUserProfileById } from '@/lib/features/profile/use-cases/getUserProfileById';

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
    const taskRepo = await getRepository(Task);

    // Get the active profile
    const profileId = await requireActiveProfileId();
    const profileResult = await getUserProfileById(profileId);

    if (!profileResult.ok) {
      return {
        ok: false,
        formError: 'Failed to find your profile. Please try again.',
        values: parsed.data,
      };
    }

    const task = new Task({
      owner: profileResult.data,
      title: parsed.data.title,
      description: parsed.data.description,
      intensity: parsed.data.intensity,
      dueAt: parsed.data.dueAt,
      tags: parsed.data.tags,
    });

    await taskRepo.save(task);

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
