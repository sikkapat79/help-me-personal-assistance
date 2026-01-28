import { getEntityManager } from '@/lib/db/mikro-orm';
import { UserProfile } from '@/lib/db/entities/UserProfile';
import { Result } from '@/lib/result';
import { AppError } from '@/lib/errors';
import { CreateUserProfileInput } from '../schema';

export async function createUserProfile(
  input: CreateUserProfileInput,
): Promise<Result<UserProfile, AppError>> {
  try {
    const em = await getEntityManager();

    const profile = new UserProfile({
      displayName: input.displayName,
      role: input.role,
      bio: input.bio,
      workingStartMinutes: input.workingStartMinutes,
      workingEndMinutes: input.workingEndMinutes,
      primaryFocusPeriod: input.primaryFocusPeriod,
    });

    await em.persistAndFlush(profile);

    return {
      ok: true,
      data: profile,
    };
  } catch (cause) {
    return {
      ok: false,
      error: new AppError('INTERNAL_ERROR', 'Failed to create profile', {
        cause,
      }),
    };
  }
}
