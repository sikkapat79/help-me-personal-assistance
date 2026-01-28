import { getEntityManager } from '@/lib/db/mikro-orm';
import { UserProfile } from '@/lib/db/entities/UserProfile';
import { Result } from '@/lib/result';
import { AppError } from '@/lib/errors';

export async function listUserProfiles(): Promise<
  Result<UserProfile[], AppError>
> {
  try {
    const em = await getEntityManager();
    const profiles = await em.find(
      UserProfile,
      {},
      { orderBy: { createdAt: 'ASC' } },
    );

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
