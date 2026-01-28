'use server';

import { revalidatePath } from 'next/cache';
import { requireActiveProfileId } from '@/lib/features/profile/activeProfile';
import { upsertDailyCheckIn } from '@/lib/features/checkin/use-cases/upsertDailyCheckIn';
import { submitCheckInSchema } from '@/lib/features/checkin/schema';
import { CheckInFormState } from '@/lib/features/checkin/types';
import { zodFieldErrors } from '@/lib/validation/forms';

export async function submitMorningCheckInAction(
  prevState: CheckInFormState | null,
  formData: FormData,
): Promise<CheckInFormState> {
  const profileId = await requireActiveProfileId();

  // Extract raw data from FormData
  const rawData = {
    checkInDate: formData.get('checkInDate'),
    restQuality1to10: formData.get('restQuality1to10'),
    morningMood: formData.get('morningMood'),
  };

  // Validate with zod
  const parsed = submitCheckInSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      ok: false,
      formError: 'Please fix the errors below.',
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  // Call use-case
  const result = await upsertDailyCheckIn(profileId, parsed.data);

  if (!result.ok) {
    return {
      ok: false,
      formError: result.error.message,
    };
  }

  // Revalidate paths to refresh server components
  revalidatePath('/');
  revalidatePath('/checkin');

  return {
    ok: true,
    message: 'Check-in saved successfully',
  };
}
