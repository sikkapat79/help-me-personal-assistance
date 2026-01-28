import { getRepository } from '@/lib/db/connection';
import { DailyCheckIn } from '@/lib/db/entities/DailyCheckIn';
import { Result, ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';

/**
 * Get a daily check-in for a specific profile and date
 * 
 * @param ownerId - User profile ID
 * @param checkInDate - Date in YYYY-MM-DD format
 * @returns Result with DailyCheckIn entity or null if not found
 */
export async function getDailyCheckInForDate(
  ownerId: string,
  checkInDate: string,
): Promise<Result<DailyCheckIn | null, AppError>> {
  try {
    const checkInRepo = await getRepository(DailyCheckIn);

    const checkIn = await checkInRepo.findOne({
      where: {
        owner: { id: ownerId },
        checkInDate,
      },
    });

    return ok(checkIn);
  } catch (cause) {
    return err(
      new AppError('DATABASE_ERROR', 'Failed to fetch daily check-in', { cause })
    );
  }
}
