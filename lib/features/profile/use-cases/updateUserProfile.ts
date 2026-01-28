import { getRepository } from '@/lib/db/connection';
import { UserProfile } from '@/lib/db/entities/UserProfile';
import { Result } from '@/lib/result';
import { AppError } from '@/lib/errors';
import { UpdateUserProfileInput } from '../schema';

export async function updateUserProfile(
  profileId: string,
  input: UpdateUserProfileInput,
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

    profile.updateProfile(input);

    await profileRepo.save(profile);

    return {
      ok: true,
      data: profile,
    };
  } catch (cause) {
    return {
      ok: false,
      error: new AppError('INTERNAL_ERROR', 'Failed to update profile', {
        cause,
      }),
    };
  }
}
