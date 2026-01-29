import { Between, In } from 'typeorm';
import { getRepository } from '@/lib/db/connection';
import { Task } from '@/lib/db/entities/Task';
import { TaskStatus } from '@/lib/features/tasks/schema';

/**
 * Fetch tasks with dueAt in [start, end] (inclusive), sorted by dueAt ASC, createdAt DESC.
 */
export async function listTasksInDateRange(
  ownerId: string,
  start: Date,
  end: Date,
): Promise<Task[]> {
  const taskRepo = await getRepository(Task);
  const tasks = await taskRepo.find({
    where: {
      owner: { id: ownerId },
      status: In([
        TaskStatus.Pending,
        TaskStatus.InProgress,
        TaskStatus.Completed,
      ]),
      dueAt: Between(start, end),
    },
    order: { dueAt: 'ASC', createdAt: 'DESC' },
  });
  return tasks;
}
