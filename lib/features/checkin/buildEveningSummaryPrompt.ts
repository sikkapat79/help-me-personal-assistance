/**
 * Build Bedrock prompt for end-of-day AI summary (what went well or bad).
 * Response is plain text: 2–3 sentences.
 */

export interface EveningSummaryContext {
  date: string; // YYYY-MM-DD
  restQuality1to10: number;
  morningMood: string;
  energyBudget: number;
  sleepNotes?: string | null;
  completedTaskTitles: string[];
  completedTaskIntensities: string[];
  totalEnergyDeducted: number;
}

const SYSTEM_PROMPT = `You are HelpMe's reflection assistant. The user tracks energy and tasks. Given a day's check-in and what they completed, write a short end-of-day summary.

Output only plain text: 2–3 sentences total. No bullet points, no JSON, no markdown.
- One sentence: what went well (output, energy use, or rest).
- One sentence: what was hard or could improve (if nothing notable, say something brief and kind).
- One optional brief takeaway or encouragement for tomorrow.

Tone: supportive, human-first, concise. Do not lecture.`;

export function buildEveningSummaryPrompt(ctx: EveningSummaryContext): {
  systemPrompt: string;
  userMessage: string;
} {
  const sleepLine = ctx.sleepNotes?.trim()
    ? `\n- Sleep notes: ${ctx.sleepNotes.trim()}`
    : '';
  const checkInBlock = `Day: ${ctx.date}
- Rest quality (1-10): ${ctx.restQuality1to10}
- Morning mood: ${ctx.morningMood}
- Energy budget (points): ${ctx.energyBudget}${sleepLine}`;

  const tasksBlock =
    ctx.completedTaskTitles.length > 0
      ? `Tasks completed (${ctx.completedTaskTitles.length}):\n${ctx.completedTaskTitles
          .map(
            (title, i) =>
              `- ${title} (${ctx.completedTaskIntensities[i] ?? 'unknown'})`,
          )
          .join('\n')}`
      : 'Tasks completed: none recorded.';
  const energyLine = `Energy used (points): ${ctx.totalEnergyDeducted} of ${ctx.energyBudget} budget.`;

  const userMessage = `${checkInBlock}

${tasksBlock}
${energyLine}

Write the 2–3 sentence end-of-day summary (plain text only).`;

  return {
    systemPrompt: SYSTEM_PROMPT,
    userMessage,
  };
}
