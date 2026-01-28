import { getEntityManager } from '@/lib/db/mikro-orm';
import { Task } from '@/lib/db/entities/Task';
import { TaskStatus } from '@/lib/features/tasks/schema';
import { Result, ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
): Promise<Result<Task, AppError>> {
  const em = await getEntityManager();

  try {
    const task = await em.findOne(Task, { id: taskId });

    if (!task) {
      return err(
        new AppError('VALIDATION_ERROR', 'Task not found', {
          cause: { taskId: ['Task does not exist'] },
        }),
      );
    }

    task.updateStatus(status);
    await em.flush();

    return ok(task);
  } catch (error) {
    if (error instanceof AppError) {
      return err(error);
    }

    return err(
      new AppError('INTERNAL_ERROR', 'Failed to update task status', {
        cause: error,
      }),
    );
  }
}
