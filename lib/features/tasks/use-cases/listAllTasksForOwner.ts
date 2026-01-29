import { In } from 'typeorm';
import { getRepository } from '@/lib/db/connection';
import { Task } from '@/lib/db/entities/Task';
import { TaskStatus } from '@/lib/features/tasks/schema';

function sortByDueAtThenCreatedAt(a: Task, b: Task): number {
  const aDue = a.dueAt?.getTime() ?? Infinity;
  const bDue = b.dueAt?.getTime() ?? Infinity;
  if (aDue !== bDue) return aDue - bDue;
  return b.createdAt.getTime() - a.createdAt.getTime();
}

export async function listAllTasksForOwner(ownerId: string): Promise<Task[]> {
  const taskRepo = await getRepository(Task);
  const tasks = await taskRepo.find({
    where: {
      owner: { id: ownerId },
      status: In([
        TaskStatus.Pending,
        TaskStatus.InProgress,
        TaskStatus.Completed,
      ]),
    },
    order: { dueAt: 'ASC', createdAt: 'DESC' },
  });
  tasks.sort(sortByDueAtThenCreatedAt);
  return tasks;
}
