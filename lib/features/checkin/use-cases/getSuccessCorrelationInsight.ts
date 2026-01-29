import { Result, ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import { invokeBedrock } from '@/lib/bedrock/invoke';
import { listDailyReportRows } from '@/lib/features/checkin/use-cases/listDailyReportRows';
import { buildSuccessCorrelationPrompt } from '@/lib/features/checkin/buildSuccessCorrelationPrompt';

/**
 * On-demand AI insight: one sentence correlation from last N days of daily report data.
 * Not persisted in v1.
 */
export async function getSuccessCorrelationInsight(
  ownerId: string,
  startDate: string,
  endDate: string,
): Promise<Result<string, AppError>> {
  try {
    const rows = await listDailyReportRows(ownerId, startDate, endDate);
    const { systemPrompt, userMessage } = buildSuccessCorrelationPrompt(rows);

    const response = await invokeBedrock({
      messages: [{ role: 'user', content: userMessage }],
      systemPrompt,
      maxTokens: 150,
    });

    const insight = response.text.trim();
    return ok(insight || 'No insight generated.');
  } catch (cause) {
    return err(
      new AppError(
        'BEDROCK_INVOKE_FAILED',
        'Failed to generate success correlation insight',
        { cause },
      ),
    );
  }
}
