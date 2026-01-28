import { getRepository } from '@/lib/db/connection';
import { UserProfile } from '@/lib/db/entities/UserProfile';
import { Result } from '@/lib/result';
import { AppError } from '@/lib/errors';

export async function listUserProfiles(): Promise<
  Result<UserProfile[], AppError>
> {
  try {
    const profileRepo = await getRepository(UserProfile);
    const profiles = await profileRepo.find({
      order: { createdAt: 'ASC' },
    });

    return {
      ok: true,
      data: profiles,
    };
  } catch (cause) {
    return {
      ok: false,
      error: new AppError('INTERNAL_ERROR', 'Failed to list profiles', {
        cause,
      }),
    };
  }
}
