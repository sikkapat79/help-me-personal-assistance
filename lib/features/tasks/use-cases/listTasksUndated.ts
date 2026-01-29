import { IsNull, In } from 'typeorm';
import { getRepository } from '@/lib/db/connection';
import { Task } from '@/lib/db/entities/Task';
import { TaskStatus } from '@/lib/features/tasks/schema';

/**
 * Fetch tasks with no due date, sorted by createdAt DESC.
 */
export async function listTasksUndated(ownerId: string): Promise<Task[]> {
  const taskRepo = await getRepository(Task);
  const tasks = await taskRepo.find({
    where: {
      owner: { id: ownerId },
      status: In([
        TaskStatus.Pending,
        TaskStatus.InProgress,
        TaskStatus.Completed,
      ]),
      dueAt: IsNull(),
    },
    order: { createdAt: 'DESC' },
  });
  return tasks;
}
