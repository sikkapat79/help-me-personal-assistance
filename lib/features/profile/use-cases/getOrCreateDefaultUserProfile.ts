import { getRepository } from '@/lib/db/connection';
import { UserProfile } from '@/lib/db/entities/UserProfile';
import { Result } from '@/lib/result';
import { AppError } from '@/lib/errors';
import { PrimaryFocusPeriod } from '../schema';

/**
 * Get or create a default user profile (for legacy data backfill convenience)
 * This is mainly used during the migration backfill
 */
export async function getOrCreateDefaultUserProfile(): Promise<
  Result<UserProfile, AppError>
> {
  try {
    const profileRepo = await getRepository(UserProfile);

    // Try to find the first existing profile
    let profile = await profileRepo.findOne({
      order: { createdAt: 'ASC' },
    });

    // If no profile exists, create a default one
    if (!profile) {
      profile = new UserProfile({
        displayName: 'Default User',
        role: 'User',
        bio: null,
        workingStartMinutes: 540, // 9:00 AM
        workingEndMinutes: 1080, // 6:00 PM
        primaryFocusPeriod: PrimaryFocusPeriod.Morning,
        timeZone: 'UTC', // Default timezone
        morningPokeTimeMinutes: 480, // 08:00
      });

      await profileRepo.save(profile);
    }

    return {
      ok: true,
      data: profile,
    };
  } catch (cause) {
    return {
      ok: false,
      error: new AppError(
        'INTERNAL_ERROR',
        'Failed to get or create default profile',
        { cause },
      ),
    };
  }
}
