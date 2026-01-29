import {
  updateTaskSchema,
  type UpdateTaskInput,
  TaskIntensity,
} from '../schema';
import type { TaskFormState } from '../types';

import { Task } from '@/lib/db/entities/Task';
import { getRepository } from '@/lib/db/connection';
import { formDataToObject, zodFieldErrors } from '@/lib/validation/forms';
import { requireActiveProfileId } from '@/lib/features/profile/activeProfile';

function rawToFormValues(
  raw: Record<string, string>,
): Partial<UpdateTaskInput> {
  const intensity =
    raw.intensity &&
    Object.values(TaskIntensity).includes(raw.intensity as TaskIntensity)
      ? (raw.intensity as TaskIntensity)
      : undefined;
  const dueAt = raw.dueAt ? new Date(raw.dueAt) : null;
  const tags = raw.tags
    ? raw.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
    : [];
  return {
    title: raw.title ?? '',
    description: raw.description ?? null,
    intensity,
    dueAt,
    tags,
  };
}

export async function updateTaskUseCase(
  formData: FormData,
): Promise<TaskFormState> {
  const raw = formDataToObject(formData);
  const parsed = updateTaskSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      formError: 'Please fix the errors below.',
      fieldErrors: zodFieldErrors(parsed.error) as TaskFormState['fieldErrors'],
      values: rawToFormValues(raw),
    };
  }

  const { taskId, ...details } = parsed.data;

  try {
    const taskRepo = await getRepository(Task);
    const activeProfileId = await requireActiveProfileId();

    const task = await taskRepo.findOne({
      where: { id: taskId },
      relations: ['owner'],
    });

    if (!task) {
      return {
        ok: false,
        formError: 'Task not found.',
        values: details as Partial<UpdateTaskInput>,
      };
    }

    if (task.owner.id !== activeProfileId) {
      return {
        ok: false,
        formError: 'Task not found.',
        values: details as Partial<UpdateTaskInput>,
      };
    }

    task.updateDetails({
      title: details.title,
      description: details.description,
      intensity: details.intensity,
      dueAt: details.dueAt,
      tags: details.tags,
    });

    await taskRepo.save(task);

    return {
      ok: true,
      message: 'Task updated successfully',
      taskId: task.id,
    };
  } catch (error) {
    console.error('Failed to update task:', error);
    return {
      ok: false,
      formError: 'Failed to update task. Please try again.',
      values: details as Partial<UpdateTaskInput>,
    };
  }
}
