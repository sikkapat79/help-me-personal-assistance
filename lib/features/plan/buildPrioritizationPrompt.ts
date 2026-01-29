import { toProfilePromptContext } from '@/lib/features/profile/aiContext';
import { UserProfileData } from '@/lib/features/profile/types';

export interface TaskForPrompt {
  id: string;
  title: string;
  intensity: string;
  dueAt: Date | null;
  tags: string[];
}

export interface CheckInForPrompt {
  planDate: string;
  restQuality1to10: number;
  morningMood: string;
  energyBudget: number;
}

const SYSTEM_PROMPT = `You are HelpMe's planning assistant. The user's energy is a currency; respect today's energy budget and mood when ordering tasks.

Output only valid JSON, no markdown or extra text. Use this exact schema:
{ "reasoningSummary": "1–3 sentences: what you recommend doing today (order, energy fit, quick wins, etc.).", "rankedTaskIds": ["uuid1", "uuid2", ...], "taskReasoning": { "uuid1": "one sentence why", "uuid2": "..." } }

Rules:
- Provide reasoningSummary: a short paragraph (1–3 sentences) summarizing what you recommend doing today—overall order, energy fit, quick wins, and any key guidance.
- Include every task ID exactly once in rankedTaskIds, in your recommended order (first = do first).
- Provide a brief one-sentence reasoning for each task in taskReasoning, keyed by task ID.
- Prefer sustainable ordering: avoid stacking many deep-focus tasks when energy is low; lean on quick wins when energy is limited.`;

export interface PrioritizationPrompt {
  systemPrompt: string;
  userMessage: string;
}

export function buildPrioritizationPrompt(
  profile: UserProfileData,
  checkIn: CheckInForPrompt,
  tasks: TaskForPrompt[],
): PrioritizationPrompt {
  const profileContext = toProfilePromptContext(profile);

  const checkInBlock = `Today's check-in (plan date: ${checkIn.planDate}):
- Rest quality (1-10): ${checkIn.restQuality1to10}
- Morning mood: ${checkIn.morningMood}
- Energy budget (points): ${checkIn.energyBudget}`;

  const taskLines = tasks.map((t) => {
    const dueStr = t.dueAt ? t.dueAt.toISOString() : 'none';
    const tagsStr = t.tags.length ? t.tags.join(', ') : 'none';
    return `- id: ${t.id} | title: ${t.title} | intensity: ${t.intensity} | dueAt: ${dueStr} | tags: ${tagsStr}`;
  });
  const tasksBlock = `Tasks to rank (use these exact IDs in rankedTaskIds):\n${taskLines.join('\n')}`;

  const userMessage = `${profileContext}

${checkInBlock}

${tasksBlock}

Return a single JSON object with reasoningSummary (1–3 sentence paragraph), rankedTaskIds (ordered list of task IDs), and taskReasoning (object mapping each task ID to a one-sentence reason). Output nothing else.`;

  return {
    systemPrompt: SYSTEM_PROMPT,
    userMessage,
  };
}
