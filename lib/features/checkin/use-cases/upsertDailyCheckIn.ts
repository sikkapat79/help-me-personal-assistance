import { getRepository } from '@/lib/db/connection';
import { DailyCheckIn } from '@/lib/db/entities/DailyCheckIn';
import { UserProfile } from '@/lib/db/entities/UserProfile';
import { Result, ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import { SubmitCheckInInput } from '../schema';
import { suggestEnergyBudget } from '../suggestEnergyBudget';

/**
 * Create or update a daily check-in for the given profile and date
 * 
 * If a check-in already exists for this profile + date, update it.
 * Otherwise, create a new check-in.
 * 
 * @param ownerId - User profile ID
 * @param input - Check-in data (validated)
 * @returns Result with the saved DailyCheckIn entity
 */
export async function upsertDailyCheckIn(
  ownerId: string,
  input: SubmitCheckInInput,
): Promise<Result<DailyCheckIn, AppError>> {
  try {
    const checkInRepo = await getRepository(DailyCheckIn);
    const profileRepo = await getRepository(UserProfile);

    // Find existing check-in for this date
    const existingCheckIn = await checkInRepo.findOne({
      where: {
        owner: { id: ownerId },
        checkInDate: input.checkInDate,
      },
      relations: ['owner'],
    });

    // Calculate energy budget from inputs
    const energyBudget = suggestEnergyBudget(input.restQuality1to10, input.morningMood);

    if (existingCheckIn) {
      // Update existing check-in
      existingCheckIn.updateCheckIn({
        restQuality1to10: input.restQuality1to10,
        morningMood: input.morningMood,
        energyBudget,
      });

      await checkInRepo.save(existingCheckIn);
      return ok(existingCheckIn);
    } else {
      // Create new check-in
      const owner = await profileRepo.findOne({ where: { id: ownerId } });
      if (!owner) {
        return err(new AppError('NOT_FOUND', 'User profile not found'));
      }

      const newCheckIn = new DailyCheckIn({
        owner,
        checkInDate: input.checkInDate,
        restQuality1to10: input.restQuality1to10,
        morningMood: input.morningMood,
        energyBudget,
      });

      await checkInRepo.save(newCheckIn);
      return ok(newCheckIn);
    }
  } catch (cause) {
    return err(
      new AppError('DATABASE_ERROR', 'Failed to save daily check-in', { cause })
    );
  }
}
