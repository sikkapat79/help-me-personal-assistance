'use server';

import { revalidatePath } from 'next/cache';
import { requireActiveProfileId } from '@/lib/features/profile/activeProfile';
import { upsertDailyCheckIn } from '@/lib/features/checkin/use-cases/upsertDailyCheckIn';
import { submitCheckInSchema } from '@/lib/features/checkin/schema';
import { CheckInFormState } from '@/lib/features/checkin/types';
import { zodFieldErrors } from '@/lib/validation/forms';
import { generateDailyPlanForDate } from '@/lib/features/plan/use-cases/generateDailyPlanForDate';

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

  let warning: string | undefined;

  // Generate or update the daily plan for this date.
  const planResult = await generateDailyPlanForDate(
    profileId,
    parsed.data.checkInDate,
  );

  if (!planResult.ok) {
    console.error(
      'Failed to generate daily plan after check-in:',
      planResult.error,
    );
    warning =
      'Your check-in was saved, but we could not refresh your daily plan. Tasks may not be fully reprioritized.';
  }

  // Revalidate paths to refresh server components
  revalidatePath('/');
  revalidatePath('/checkin');

  return {
    ok: true,
    message: 'Check-in saved successfully',
    warning,
  };
}
