import type { Task } from '@/lib/db/entities/Task';
import type { TaskData } from './types';

export function taskToTaskData(task: Task): TaskData {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    intensity: task.intensity,
    dueAt: task.dueAt,
    tags: task.tags,
    status: task.status,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    completedAt: task.completedAt ?? null,
  };
}
