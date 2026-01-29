import type { DailyReportRow } from '@/lib/features/checkin/use-cases/listDailyReportRows';

const SYSTEM_PROMPT = `You are HelpMe's analytics assistant. Given a short series of daily data (rest quality 1-10, tasks completed, energy used), output exactly one concise sentence that states a simple correlation or insight: e.g. "Your output increases when rest is above 7/10" or "On low-rest days you completed fewer tasks."

Output only that one sentence. No preamble, no bullet points, no JSON. Plain text only.`;

export function buildSuccessCorrelationPrompt(rows: DailyReportRow[]): {
  systemPrompt: string;
  userMessage: string;
} {
  if (rows.length === 0) {
    return {
      systemPrompt: SYSTEM_PROMPT,
      userMessage:
        'No daily data. Reply with: "Log a few days of check-ins and tasks to see insights."',
    };
  }

  const lines = rows.map(
    (r) =>
      `${r.date}: rest ${r.restQuality1to10}/10, tasks done ${r.tasksCompletedCount}, energy used ${r.energyUsed}/${r.energyBudget}`,
  );
  const userMessage = `Daily data (rest, tasks completed, energy used):\n${lines.join('\n')}\n\nOne sentence correlation or insight:`;

  return {
    systemPrompt: SYSTEM_PROMPT,
    userMessage,
  };
}
