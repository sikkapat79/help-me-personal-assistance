import { getRepository } from '@/lib/db/connection';
import { Task } from '@/lib/db/entities/Task';
import { Result, ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import { requireActiveProfileId } from '@/lib/features/profile/activeProfile';

export async function deleteTask(
  taskId: string,
): Promise<Result<{ deleted: true }, AppError>> {
  const taskRepo = await getRepository(Task);
  const activeProfileId = await requireActiveProfileId();

  try {
    const task = await taskRepo.findOne({
      where: { id: taskId },
      relations: ['owner'],
    });

    if (!task) {
      return err(
        new AppError('VALIDATION_ERROR', 'Task not found', {
          cause: { taskId: ['Task does not exist'] },
        }),
      );
    }

    if (task.owner.id !== activeProfileId) {
      return err(
        new AppError('VALIDATION_ERROR', 'Task not found', {
          cause: { taskId: ['Task does not exist'] },
        }),
      );
    }

    await taskRepo.remove(task);

    return ok({ deleted: true });
  } catch (error) {
    if (error instanceof AppError) {
      return err(error);
    }

    return err(
      new AppError('DATABASE_ERROR', 'Failed to delete task', {
        cause: error,
      }),
    );
  }
}
