'use server';

import { revalidatePath } from 'next/cache';
import { requireActiveProfileId } from '@/lib/features/profile/activeProfile';
import { generateEveningSummaryForDate } from '@/lib/features/checkin/use-cases/generateEveningSummaryForDate';

/**
 * Fallback: generate yesterday's evening summary on demand (e.g. when Bedrock failed during check-in).
 * Only intended when yesterday has a check-in but no evening_summary yet.
 */
export async function generateYesterdaySummaryAction(
  yesterdayYyyyMmDd: string,
): Promise<{ ok: boolean; message: string }> {
  const profileId = await requireActiveProfileId();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(yesterdayYyyyMmDd)) {
    return { ok: false, message: 'Invalid date.' };
  }

  const result = await generateEveningSummaryForDate(
    profileId,
    yesterdayYyyyMmDd,
  );

  if (!result.ok) {
    return { ok: false, message: result.error.message };
  }

  revalidatePath('/');
  return { ok: true, message: 'Yesterday’s summary generated.' };
}
