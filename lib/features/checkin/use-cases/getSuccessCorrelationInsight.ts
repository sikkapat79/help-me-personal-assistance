import { Result, ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import { invokeBedrock } from '@/lib/bedrock/invoke';
import { listDailyReportRows } from '@/lib/features/checkin/use-cases/listDailyReportRows';
import type { DailyReportRow } from '@/lib/features/checkin/use-cases/listDailyReportRows';
import { buildSuccessCorrelationPrompt } from '@/lib/features/checkin/buildSuccessCorrelationPrompt';

/**
 * On-demand AI insight: one sentence correlation from last N days of daily report data.
 * Not persisted in v1.
 * When `rows` is provided, skips listDailyReportRows (caller owns the data).
 */
export async function getSuccessCorrelationInsight(
  ownerId: string,
  startDate: string,
  endDate: string,
  rows?: DailyReportRow[],
): Promise<Result<string, AppError>> {
  try {
    const resolvedRows =
      rows ?? (await listDailyReportRows(ownerId, startDate, endDate));
    const { systemPrompt, userMessage } =
      buildSuccessCorrelationPrompt(resolvedRows);

    const tBedrock = Date.now();
    const response = await invokeBedrock({
      messages: [{ role: 'user', content: userMessage }],
      systemPrompt,
      maxTokens: 150,
    });
    if (process.env.NODE_ENV === 'development') {
      console.log('[trends] invokeBedrock (success correlation)', Date.now() - tBedrock, 'ms');
    }

    const insight = response.text.trim();
    return ok(insight || 'No insight generated.');
  } catch (error_) {
    return err(
      new AppError(
        'BEDROCK_INVOKE_FAILED',
        'Failed to generate success correlation insight',
        { cause: error_ },
      ),
    );
  }
}
