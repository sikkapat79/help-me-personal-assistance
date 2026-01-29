'use server';

import { revalidatePath } from 'next/cache';
import { requireActiveProfileId } from '@/lib/features/profile/activeProfile';
import { getUserProfileById } from '@/lib/features/profile/use-cases/getUserProfileById';
import { getYyyyMmDdInTimeZone } from '@/lib/time';
import { generateDailyPlanForDate } from '@/lib/features/plan/use-cases/generateDailyPlanForDate';

export type ReprioritizeTodayResult =
  | { ok: true }
  | { ok: false; error: string };

export async function reprioritizeTodayAction(): Promise<ReprioritizeTodayResult> {
  const profileId = await requireActiveProfileId();

  const profileResult = await getUserProfileById(profileId);
  const timeZone = profileResult.ok
    ? (profileResult.data.timeZone ?? 'UTC')
    : 'UTC';
  const today = getYyyyMmDdInTimeZone(timeZone);

  const planResult = await generateDailyPlanForDate(profileId, today);

  if (!planResult.ok) {
    return {
      ok: false,
      error: planResult.error.message,
    };
  }

  revalidatePath('/');
  return { ok: true };
}
