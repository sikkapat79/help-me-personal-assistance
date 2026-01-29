import { getRepository } from '@/lib/db/connection';
import { Task } from '@/lib/db/entities/Task';
import { EnergyDeductionEvent } from '@/lib/db/entities/EnergyDeductionEvent';
import { TaskStatus } from '@/lib/features/tasks/schema';
import { Result, ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import { requireActiveProfileId } from '@/lib/features/profile/activeProfile';
import { getUserProfileById } from '@/lib/features/profile/use-cases/getUserProfileById';
import { getDailyCheckInForDate } from '@/lib/features/checkin/use-cases/getDailyCheckInForDate';
import { getYyyyMmDdInTimeZone } from '@/lib/time';
import {
  computeEnergyDeduction,
  type CapacityStateAfter,
} from '@/lib/features/checkin/energyDeduction';

export interface CompleteTaskWithEnergyResult {
  task: Task;
  energyNotTracked?: boolean;
}

/**
 * Complete a task and stamp post-task energy feedback as an event.
 * If no check-in for today, task is completed but no event is appended (energyNotTracked).
 */
export async function completeTaskWithEnergyFeedback(
  taskId: string,
  capacityStateAfter: CapacityStateAfter,
): Promise<Result<CompleteTaskWithEnergyResult, AppError>> {
  const activeProfileId = await requireActiveProfileId();

  const taskRepo = await getRepository(Task);
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

  const profileResult = await getUserProfileById(activeProfileId);
  const timeZone = profileResult.ok
    ? (profileResult.data.timeZone ?? 'UTC')
    : 'UTC';
  const today = getYyyyMmDdInTimeZone(timeZone);

  const checkInResult = await getDailyCheckInForDate(activeProfileId, today);
  const hasCheckIn = checkInResult.ok && checkInResult.data != null;

  if (hasCheckIn) {
    const deductedAmount = computeEnergyDeduction(
      task.intensity,
      capacityStateAfter,
    );
    const eventRepo = await getRepository(EnergyDeductionEvent);
    const event = new EnergyDeductionEvent({
      owner: task.owner,
      planDate: today,
      task,
      capacityStateAfter,
      deductedAmount,
      taskIntensitySnapshot: task.intensity,
    });
    await eventRepo.save(event);
  }

  task.updateStatus(TaskStatus.Completed);
  await taskRepo.save(task);

  return ok({
    task,
    energyNotTracked: !hasCheckIn,
  });
}
