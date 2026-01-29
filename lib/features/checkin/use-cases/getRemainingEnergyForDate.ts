import { getRepository } from '@/lib/db/connection';
import { DailyCheckIn } from '@/lib/db/entities/DailyCheckIn';
import { EnergyDeductionEvent } from '@/lib/db/entities/EnergyDeductionEvent';
import { Result, ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';

export interface RemainingEnergyForDate {
  energyBudget: number;
  totalDeducted: number;
  remaining: number;
}

/**
 * Derive remaining energy for a date from check-in (energyBudget) minus sum of deduction events.
 * If no check-in for that date, returns { energyBudget: 0, totalDeducted: 0, remaining: 0 }.
 */
export async function getRemainingEnergyForDate(
  ownerId: string,
  planDate: string,
): Promise<Result<RemainingEnergyForDate, AppError>> {
  try {
    const checkInRepo = await getRepository(DailyCheckIn);
    const checkIn = await checkInRepo.findOne({
      where: {
        owner: { id: ownerId },
        checkInDate: planDate,
      },
    });

    if (!checkIn) {
      return ok({
        energyBudget: 0,
        totalDeducted: 0,
        remaining: 0,
      });
    }

    const eventRepo = await getRepository(EnergyDeductionEvent);
    const events = await eventRepo.find({
      where: {
        owner: { id: ownerId },
        planDate,
      },
      select: ['deductedAmount'],
    });

    const totalDeducted = events.reduce((sum, e) => sum + e.deductedAmount, 0);
    const remaining = Math.max(0, checkIn.energyBudget - totalDeducted);

    return ok({
      energyBudget: checkIn.energyBudget,
      totalDeducted,
      remaining,
    });
  } catch (error_) {
    return err(
      new AppError('DATABASE_ERROR', 'Failed to get remaining energy', {
        cause: error_,
      }),
    );
  }
}
