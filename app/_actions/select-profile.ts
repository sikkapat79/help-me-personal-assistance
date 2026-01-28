'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { setActiveProfileIdCookie } from '@/lib/features/profile/activeProfile';
import { getUserProfileById } from '@/lib/features/profile/use-cases/getUserProfileById';
import { Result } from '@/lib/result';
import { AppError } from '@/lib/errors';

const selectProfileSchema = z.object({
  profileId: z.string().uuid('Invalid profile ID'),
});

export async function selectProfileAction(
  profileId: string,
): Promise<Result<{ success: boolean }, AppError>> {
  const parsed = selectProfileSchema.safeParse({ profileId });

  if (!parsed.success) {
    return {
      ok: false,
      error: new AppError('VALIDATION_ERROR', 'Invalid profile ID', {
        cause: parsed.error.flatten().fieldErrors,
      }),
    };
  }

  // Verify profile exists
  const profileResult = await getUserProfileById(parsed.data.profileId);

  if (!profileResult.ok) {
    return profileResult;
  }

  // Set cookie
  await setActiveProfileIdCookie(parsed.data.profileId);

  // Redirect to home
  redirect('/');
}
