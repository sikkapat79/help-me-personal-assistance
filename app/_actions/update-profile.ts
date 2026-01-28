'use server';

import { revalidatePath } from 'next/cache';

import { requireActiveProfileId } from '@/lib/features/profile/activeProfile';
import { updateUserProfile } from '@/lib/features/profile/use-cases/updateUserProfile';
import { updateUserProfileSchema } from '@/lib/features/profile/schema';
import { Result } from '@/lib/result';
import { AppError } from '@/lib/errors';

export async function updateProfileAction(
  prevState: Result<{ success: boolean }, AppError> | null,
  formData: FormData,
): Promise<Result<{ success: boolean }, AppError>> {
  const profileId = await requireActiveProfileId();

  const rawData = {
    displayName: formData.get('displayName'),
    role: formData.get('role'),
    bio: formData.get('bio'),
    workingStartMinutes: formData.get('workingStartMinutes'),
    workingEndMinutes: formData.get('workingEndMinutes'),
    primaryFocusPeriod: formData.get('primaryFocusPeriod'),
  };

  // Parse and validate
  const parsed = updateUserProfileSchema.safeParse({
    displayName: rawData.displayName,
    role: rawData.role,
    bio: rawData.bio,
    workingStartMinutes: rawData.workingStartMinutes
      ? Number(rawData.workingStartMinutes)
      : undefined,
    workingEndMinutes: rawData.workingEndMinutes
      ? Number(rawData.workingEndMinutes)
      : undefined,
    primaryFocusPeriod: rawData.primaryFocusPeriod,
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: new AppError('VALIDATION_ERROR', 'Invalid input', {
        cause: parsed.error.flatten().fieldErrors,
      }),
    };
  }

  const result = await updateUserProfile(profileId, parsed.data);

  if (!result.ok) {
    return result;
  }

  // Revalidate paths
  revalidatePath('/');
  revalidatePath('/calibration');

  return {
    ok: true,
    data: { success: true },
  };
}
