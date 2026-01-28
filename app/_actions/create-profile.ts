'use server';

import { redirect } from 'next/navigation';

import { setActiveProfileIdCookie } from '@/lib/features/profile/activeProfile';
import { createUserProfile } from '@/lib/features/profile/use-cases/createUserProfile';
import { createUserProfileSchema } from '@/lib/features/profile/schema';
import { Result } from '@/lib/result';
import { AppError } from '@/lib/errors';

export async function createProfileAction(
  prevState: Result<{ success: boolean }, AppError> | null,
  formData: FormData,
): Promise<Result<{ success: boolean }, AppError>> {
  const rawData = {
    displayName: formData.get('displayName'),
    role: formData.get('role'),
    bio: formData.get('bio'),
    workingStartMinutes: formData.get('workingStartMinutes'),
    workingEndMinutes: formData.get('workingEndMinutes'),
    primaryFocusPeriod: formData.get('primaryFocusPeriod'),
  };

  // Parse and validate
  const parsed = createUserProfileSchema.safeParse({
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

  const result = await createUserProfile(parsed.data);

  if (!result.ok) {
    return result;
  }

  // Set cookie to the newly created profile
  await setActiveProfileIdCookie(result.data.id);

  // Redirect to home
  redirect('/');
}
