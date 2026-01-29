'use server';

import { requireActiveProfileId } from '@/lib/features/profile/activeProfile';
import { getSuccessCorrelationInsight } from '@/lib/features/checkin/use-cases/getSuccessCorrelationInsight';
import type { DailyReportRow } from '@/lib/features/checkin/use-cases/listDailyReportRows';

/**
 * Fetches the success correlation insight from Bedrock using pre-fetched rows.
 * Used by the trends page so the initial load does not block on Bedrock.
 */
export async function fetchSuccessCorrelationInsightAction(
  startDate: string,
  endDate: string,
  rows: DailyReportRow[],
): Promise<{ ok: true; insight: string } | { ok: false; error: string }> {
  const profileId = await requireActiveProfileId();

  const validDate = /^\d{4}-\d{2}-\d{2}$/;
  if (!validDate.test(startDate) || !validDate.test(endDate)) {
    return { ok: false, error: 'Invalid date range.' };
  }

  const result = await getSuccessCorrelationInsight(
    profileId,
    startDate,
    endDate,
    rows,
  );

  if (result.ok) {
    const trimmed = result.data.trim();
    const insight = trimmed.length > 0 ? result.data : 'No insight generated.';
    return { ok: true, insight };
  }
  return { ok: false, error: result.error.message };
}
