import { getRepository } from '@/lib/db/connection';
import { UserProfile } from '@/lib/db/entities/UserProfile';
import { Result } from '@/lib/result';
import { AppError } from '@/lib/errors';

export async function getUserProfileById(
  profileId: string,
): Promise<Result<UserProfile, AppError>> {
  try {
    const profileRepo = await getRepository(UserProfile);
    const profile = await profileRepo.findOne({ where: { id: profileId } });

    if (!profile) {
      return {
        ok: false,
        error: new AppError('NOT_FOUND', 'Profile not found'),
      };
    }

    return {
      ok: true,
      data: profile,
    };
  } catch (cause) {
    return {
      ok: false,
      error: new AppError('INTERNAL_ERROR', 'Failed to fetch profile', {
        cause,
      }),
    };
  }
}
