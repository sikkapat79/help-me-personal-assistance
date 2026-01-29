'use server';

import dayjs from 'dayjs';
import { revalidatePath } from 'next/cache';
import { requireActiveProfileId } from '@/lib/features/profile/activeProfile';
import { upsertDailyCheckIn } from '@/lib/features/checkin/use-cases/upsertDailyCheckIn';
import { getDailyCheckInForDate } from '@/lib/features/checkin/use-cases/getDailyCheckInForDate';
import { generateEveningSummaryForDate } from '@/lib/features/checkin/use-cases/generateEveningSummaryForDate';
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
    sleepNotes: formData.get('sleepNotes'),
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

  // Automatically generate evening summary for yesterday (if yesterday has a check-in and no summary yet)
  const yesterday = dayjs(parsed.data.checkInDate)
    .subtract(1, 'day')
    .format('YYYY-MM-DD');
  const yesterdayCheckInResult = await getDailyCheckInForDate(
    profileId,
    yesterday,
  );
  if (
    yesterdayCheckInResult.ok &&
    yesterdayCheckInResult.data != null &&
    (yesterdayCheckInResult.data.eveningSummary == null ||
      yesterdayCheckInResult.data.eveningSummary.trim() === '')
  ) {
    const summaryResult = await generateEveningSummaryForDate(
      profileId,
      yesterday,
    );
    if (!summaryResult.ok) {
      console.error(
        'Failed to generate yesterday’s evening summary after check-in:',
        summaryResult.error,
      );
      warning = warning
        ? `${warning} Yesterday’s summary could not be generated.`
        : 'Your check-in was saved; yesterday’s summary could not be generated.';
    }
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
