import { Not } from 'typeorm';

import { getRepository } from '@/lib/db/connection';
import { DailyPlan } from '@/lib/db/entities/DailyPlan';
import { DailyCheckIn } from '@/lib/db/entities/DailyCheckIn';
import { Task } from '@/lib/db/entities/Task';
import { TaskIntensity, TaskStatus } from '@/lib/features/tasks/schema';
import { Result, ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import { invokeBedrock } from '@/lib/bedrock/invoke';
import { getUserProfileById } from '@/lib/features/profile/use-cases/getUserProfileById';
import { toUserProfileData } from '@/lib/features/profile/mappers';
import {
  buildPrioritizationPrompt,
  type TaskForPrompt,
} from '@/lib/features/plan/buildPrioritizationPrompt';

const ALGORITHM_VERSION_HEURISTIC = 'v1-det-heuristic';
const ALGORITHM_VERSION_LLM = 'v2-llm';

const HEURISTIC_REASONING_SUMMARY =
  "Ordered by urgency, intensity, and energy fit. Use as guidance — you're in control.";

function intensityScore(intensity: TaskIntensity): {
  base: number;
  label: string;
} {
  switch (intensity) {
    case TaskIntensity.DeepFocus:
      return { base: 20, label: 'DeepFocus (high intensity)' };
    case TaskIntensity.Routine:
      return { base: 10, label: 'Routine (medium intensity)' };
    case TaskIntensity.QuickWin:
      return { base: 15, label: 'QuickWin (low effort, fast win)' };
    case TaskIntensity.Meeting:
      return { base: 5, label: 'Meeting' };
    default:
      return { base: 0, label: 'Unspecified intensity' };
  }
}

interface ScoredTask {
  id: string;
  score: number;
  reasoning: string;
}

interface LlmPrioritizationResult {
  rankedTaskIds: string[];
  taskReasoning: Record<string, string>;
  reasoningSummary: string | null;
}

/**
 * Try to get ranked task order and reasoning from the LLM.
 * Returns null on any failure (profile missing, Bedrock error, parse error, invalid IDs).
 */
async function tryLlmPrioritization(
  ownerId: string,
  checkIn: DailyCheckIn,
  tasks: Task[],
  taskIdSet: Set<string>,
): Promise<LlmPrioritizationResult | null> {
  const profileResult = await getUserProfileById(ownerId);
  if (!profileResult.ok) {
    return null;
  }

  const profileData = toUserProfileData(profileResult.data);
  const tasksForPrompt: TaskForPrompt[] = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    intensity: t.intensity,
    dueAt: t.dueAt,
    tags: t.tags,
  }));
  const { systemPrompt, userMessage } = buildPrioritizationPrompt(
    profileData,
    {
      planDate: checkIn.checkInDate,
      restQuality1to10: checkIn.restQuality1to10,
      morningMood: checkIn.morningMood,
      energyBudget: checkIn.energyBudget,
    },
    tasksForPrompt,
  );

  let responseText: string;
  try {
    const response = await invokeBedrock({
      messages: [{ role: 'user', content: userMessage }],
      systemPrompt,
      maxTokens: 2000,
    });
    responseText = response.text;
  } catch (error_) {
    console.error(
      'Bedrock prioritization failed, falling back to heuristic:',
      error_,
    );
    return null;
  }

  const parsed = parseLlmPrioritizationResponse(responseText);
  if (!parsed) {
    return null;
  }

  const fromLlm = (parsed.rankedTaskIds ?? []).filter((id) =>
    taskIdSet.has(id),
  );
  const missingIds = tasks
    .filter((t) => !fromLlm.includes(t.id))
    .map((t) => t.id);
  const rankedTaskIds = [...fromLlm, ...missingIds];

  const taskReasoning: Record<string, string> = {};
  for (const id of taskIdSet) {
    const reason = parsed.taskReasoning?.[id];
    taskReasoning[id] =
      typeof reason === 'string' && reason.trim()
        ? reason.trim()
        : 'No reasoning provided.';
  }

  return {
    rankedTaskIds,
    taskReasoning,
    reasoningSummary: parsed.reasoningSummary ?? null,
  };
}

type LlmParsedResponse = {
  rankedTaskIds: string[];
  taskReasoning: Record<string, string>;
  reasoningSummary?: string | null;
};

/**
 * Parse LLM response into { rankedTaskIds, taskReasoning, reasoningSummary }.
 * Strips optional markdown code fence, then JSON.parse. Returns null on failure.
 */
function parseLlmPrioritizationResponse(raw: string): LlmParsedResponse | null {
  let jsonStr = raw.trim();
  const codeFenceRe = /^```(?:json)?\s*([\s\S]*?)```\s*$/m;
  const codeBlockMatch = codeFenceRe.exec(jsonStr);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  }

  try {
    const parsed = JSON.parse(jsonStr) as unknown;
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    const obj = parsed as Record<string, unknown>;
    const rankedTaskIds = Array.isArray(obj.rankedTaskIds)
      ? obj.rankedTaskIds.filter((id: unknown) => typeof id === 'string')
      : [];
    const taskReasoning =
      obj.taskReasoning && typeof obj.taskReasoning === 'object'
        ? (obj.taskReasoning as Record<string, unknown>)
        : {};
    const taskReasoningStrings: Record<string, string> = {};
    for (const [k, v] of Object.entries(taskReasoning)) {
      if (typeof k === 'string' && typeof v === 'string') {
        taskReasoningStrings[k] = v;
      }
    }
    const rawSummary = obj.reasoningSummary;
    const reasoningSummary =
      typeof rawSummary === 'string' && rawSummary.trim()
        ? rawSummary.trim()
        : null;
    return {
      rankedTaskIds,
      taskReasoning: taskReasoningStrings,
      reasoningSummary,
    };
  } catch {
    return null;
  }
}

export async function generateDailyPlanForDate(
  ownerId: string,
  planDate: string,
): Promise<Result<DailyPlan, AppError>> {
  try {
    const checkInRepo = await getRepository(DailyCheckIn);
    const taskRepo = await getRepository(Task);
    const planRepo = await getRepository(DailyPlan);

    const checkIn = await checkInRepo.findOne({
      where: {
        owner: { id: ownerId },
        checkInDate: planDate,
      },
      relations: ['owner'],
    });

    if (!checkIn) {
      console.warn('No check-in found for this date', { ownerId, planDate });
      return err(
        new AppError(
          'NOT_FOUND',
          'Cannot generate daily plan without a check-in for this date',
        ),
      );
    }

    const tasks = await taskRepo.find({
      where: {
        owner: { id: ownerId },
        status: Not(TaskStatus.Completed),
      },
    });

    if (tasks.length === 0) {
      console.warn('No tasks found for this date', { ownerId, planDate });
      // If there are no tasks, still upsert an empty plan so UI can show an explicit empty state.
      const existingEmptyPlan = await planRepo.findOne({
        where: {
          owner: { id: ownerId },
          planDate,
        },
        relations: ['owner'],
      });

      if (existingEmptyPlan) {
        existingEmptyPlan.updatePlan({
          energyBudget: checkIn.energyBudget,
          algorithmVersion: ALGORITHM_VERSION_HEURISTIC,
          rankedTaskIds: [],
          taskReasoning: {},
        });
        await planRepo.save(existingEmptyPlan);
        return ok(existingEmptyPlan);
      }

      const emptyPlan = new DailyPlan({
        owner: checkIn.owner,
        planDate,
        energyBudget: checkIn.energyBudget,
        algorithmVersion: ALGORITHM_VERSION_HEURISTIC,
        rankedTaskIds: [],
        taskReasoning: {},
      });
      await planRepo.save(emptyPlan);
      return ok(emptyPlan);
    }

    const taskIdSet = new Set(tasks.map((t) => t.id));
    let rankedTaskIds: string[];
    let taskReasoning: Record<string, string>;
    let algorithmVersion: string;
    let reasoningSummary: string | null;

    const llmResult = await tryLlmPrioritization(
      ownerId,
      checkIn,
      tasks,
      taskIdSet,
    );

    if (llmResult) {
      rankedTaskIds = llmResult.rankedTaskIds;
      taskReasoning = llmResult.taskReasoning;
      algorithmVersion = ALGORITHM_VERSION_LLM;
      reasoningSummary = llmResult.reasoningSummary;
    } else {
      const scored = scoreTasksDeterministically(
        tasks,
        checkIn.energyBudget,
        planDate,
      );
      rankedTaskIds = scored.map((t) => t.id);
      taskReasoning = {};
      for (const t of scored) {
        taskReasoning[t.id] = t.reasoning;
      }
      algorithmVersion = ALGORITHM_VERSION_HEURISTIC;
      reasoningSummary = HEURISTIC_REASONING_SUMMARY;
    }

    const existingPlan = await planRepo.findOne({
      where: {
        owner: { id: ownerId },
        planDate,
      },
      relations: ['owner'],
    });

    if (existingPlan) {
      existingPlan.updatePlan({
        energyBudget: checkIn.energyBudget,
        algorithmVersion,
        rankedTaskIds,
        taskReasoning,
        reasoningSummary,
      });
      await planRepo.save(existingPlan);
      return ok(existingPlan);
    }

    const plan = new DailyPlan({
      owner: checkIn.owner,
      planDate,
      energyBudget: checkIn.energyBudget,
      algorithmVersion,
      rankedTaskIds,
      taskReasoning,
      reasoningSummary,
    });

    await planRepo.save(plan);
    return ok(plan);
  } catch (error_) {
    return err(
      new AppError('DATABASE_ERROR', 'Failed to generate daily plan', {
        cause: error_,
      }),
    );
  }
}

function scoreTasksDeterministically(
  tasks: Task[],
  energyBudget: number,
  planDate: string,
): ScoredTask[] {
  const today = new Date(planDate);

  function urgencyScore(dueAt: Date | null): { score: number; reason: string } {
    if (!dueAt) {
      return { score: 0, reason: 'No due date' };
    }

    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const startOfDue = new Date(
      dueAt.getFullYear(),
      dueAt.getMonth(),
      dueAt.getDate(),
    );

    const diffMs = startOfDue.getTime() - startOfToday.getTime();
    const days = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (days < 0) {
      return { score: 40, reason: 'Overdue' };
    }
    if (days === 0) {
      return { score: 30, reason: 'Due today' };
    }
    if (days === 1) {
      return { score: 20, reason: 'Due tomorrow' };
    }
    if (days <= 7) {
      return { score: 10, reason: 'Due later this week' };
    }
    return { score: 0, reason: 'Due later' };
  }

  function energyFitAdjustment(intensity: TaskIntensity): {
    delta: number;
    note: string;
  } {
    if (energyBudget >= 70) {
      // High energy: reward DeepFocus slightly
      if (intensity === TaskIntensity.DeepFocus) {
        return {
          delta: 10,
          note: 'High energy — prioritizing deep focus work',
        };
      }
      if (intensity === TaskIntensity.QuickWin) {
        return {
          delta: 0,
          note: 'High energy — quick wins are fine but not primary',
        };
      }
      return { delta: 0, note: 'Energy is sufficient for most tasks' };
    }

    if (energyBudget <= 30) {
      // Low energy: penalize DeepFocus, reward QuickWin
      if (intensity === TaskIntensity.DeepFocus) {
        return {
          delta: -15,
          note: 'Low energy — de-prioritizing deep focus to avoid burnout',
        };
      }
      if (intensity === TaskIntensity.QuickWin) {
        return {
          delta: 10,
          note: 'Low energy — leaning on quick wins to maintain momentum',
        };
      }
      return {
        delta: 0,
        note: 'Low energy — keep workload sustainable',
      };
    }

    // Medium energy: keep things balanced
    if (intensity === TaskIntensity.DeepFocus) {
      return {
        delta: 5,
        note: 'Medium energy — one or two deep focus blocks are appropriate',
      };
    }
    return { delta: 0, note: 'Medium energy — flexible across task types' };
  }

  const scored: ScoredTask[] = tasks.map((task) => {
    const urgency = urgencyScore(task.dueAt);
    const intensity = intensityScore(task.intensity);
    const energyFit = energyFitAdjustment(task.intensity);

    let score = urgency.score + intensity.base + energyFit.delta;

    // Soft guardrail: avoid too many DeepFocus tasks when energy is low
    // Implemented later by sorting, but we can slightly penalize many DeepFocus tasks
    if (energyBudget <= 30 && task.intensity === TaskIntensity.DeepFocus) {
      score -= 5;
    }

    const reasoningParts = [
      urgency.reason,
      intensity.label,
      energyFit.note,
    ].filter(Boolean);

    const reasoning = reasoningParts.join(' • ');

    return {
      id: task.id,
      score,
      reasoning,
    };
  });

  // Sort descending by score, then by createdAt (older first to reduce carryover)
  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    const taskA = tasks.find((t) => t.id === a.id)!;
    const taskB = tasks.find((t) => t.id === b.id)!;
    return taskA.createdAt.getTime() - taskB.createdAt.getTime();
  });

  return scored;
}
