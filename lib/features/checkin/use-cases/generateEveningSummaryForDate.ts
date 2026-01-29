import { Between } from 'typeorm';

import { getRepository } from '@/lib/db/connection';
import { DailyCheckIn } from '@/lib/db/entities/DailyCheckIn';
import { EnergyDeductionEvent } from '@/lib/db/entities/EnergyDeductionEvent';
import { Task } from '@/lib/db/entities/Task';
import { TaskStatus } from '@/lib/features/tasks/schema';
import { Result, ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import { invokeBedrock } from '@/lib/bedrock/invoke';
import { getUserProfileById } from '@/lib/features/profile/use-cases/getUserProfileById';
import { getDateStartEndInTimeZone } from '@/lib/time';
import { buildEveningSummaryPrompt } from '@/lib/features/checkin/buildEveningSummaryPrompt';

/**
 * Generate and persist an AI evening summary for a given date.
 * Loads check-in, tasks completed that day, and energy events; calls Bedrock; updates check-in.
 * Skips if no check-in for that date. Idempotent: overwrites existing evening_summary if run again.
 */
export async function generateEveningSummaryForDate(
  ownerId: string,
  date: string, // YYYY-MM-DD
): Promise<Result<{ summary: string }, AppError>> {
  try {
    const checkInRepo = await getRepository(DailyCheckIn);
    const checkIn = await checkInRepo.findOne({
      where: { owner: { id: ownerId }, checkInDate: date },
      relations: ['owner'],
    });

    if (!checkIn) {
      return err(
        new AppError(
          'NOT_FOUND',
          'No check-in for this date; cannot generate evening summary',
        ),
      );
    }

    const profileResult = await getUserProfileById(ownerId);
    const timeZone = profileResult.ok
      ? (profileResult.data.timeZone ?? 'UTC')
      : 'UTC';

    const { start, end } = getDateStartEndInTimeZone(timeZone, date);

    const taskRepo = await getRepository(Task);
    const completedTasks = await taskRepo.find({
      where: {
        owner: { id: ownerId },
        status: TaskStatus.Completed,
        completedAt: Between(start, end),
      },
      order: { completedAt: 'ASC' },
    });

    const eventRepo = await getRepository(EnergyDeductionEvent);
    const events = await eventRepo.find({
      where: { owner: { id: ownerId }, planDate: date },
      select: ['deductedAmount'],
    });
    const totalEnergyDeducted = events.reduce(
      (sum, e) => sum + e.deductedAmount,
      0,
    );

    const { systemPrompt, userMessage } = buildEveningSummaryPrompt({
      date: checkIn.checkInDate,
      restQuality1to10: checkIn.restQuality1to10,
      morningMood: checkIn.morningMood,
      energyBudget: checkIn.energyBudget,
      sleepNotes: checkIn.sleepNotes ?? null,
      completedTaskTitles: completedTasks.map((t) => t.title),
      completedTaskIntensities: completedTasks.map((t) => t.intensity),
      totalEnergyDeducted,
    });

    const response = await invokeBedrock({
      messages: [{ role: 'user', content: userMessage }],
      systemPrompt,
      maxTokens: 500,
    });

    const summary = response.text.trim();
    if (!summary) {
      return err(
        new AppError(
          'BEDROCK_RESPONSE_INVALID',
          'Evening summary response was empty',
        ),
      );
    }

    checkIn.setEveningSummary(summary);
    await checkInRepo.save(checkIn);

    return ok({ summary });
  } catch (cause) {
    return err(
      new AppError('DATABASE_ERROR', 'Failed to generate evening summary', {
        cause,
      }),
    );
  }
}
