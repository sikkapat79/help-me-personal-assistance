import { getRepository } from '@/lib/db/connection';
import { DailyPlan } from '@/lib/db/entities/DailyPlan';
import { Result, ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';

export async function getDailyPlanForDate(
  ownerId: string,
  planDate: string,
): Promise<Result<DailyPlan | null, AppError>> {
  try {
    const planRepo = await getRepository(DailyPlan);

    const plan = await planRepo.findOne({
      where: {
        owner: { id: ownerId },
        planDate,
      },
      relations: ['owner'],
    });

    return ok(plan);
  } catch (error_) {
    return err(
      new AppError('DATABASE_ERROR', 'Failed to fetch daily plan', {
        cause: error_,
      }),
    );
  }
}
