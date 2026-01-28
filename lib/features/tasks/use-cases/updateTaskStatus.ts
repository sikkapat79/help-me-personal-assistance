import { getRepository } from '@/lib/db/connection';
import { Task } from '@/lib/db/entities/Task';
import { TaskStatus } from '@/lib/features/tasks/schema';
import { Result, ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import { requireActiveProfileId } from '@/lib/features/profile/activeProfile';

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
): Promise<Result<Task, AppError>> {
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

    // Ensure the task belongs to the active owner (guardrail)
    // Use the owner relationship to check ownership
    if (task.owner.id !== activeProfileId) {
      return err(
        new AppError('VALIDATION_ERROR', 'Task not found', {
          cause: { taskId: ['Task does not exist'] },
        }),
      );
    }

    task.updateStatus(status);
    await taskRepo.save(task);

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
