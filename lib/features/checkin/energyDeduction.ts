import { TaskIntensity } from '@/lib/features/tasks/schema';
import { MorningMood } from './schema';

/** Post-task capacity state (reuse MorningMood: Fresh / Neutral / Tired / Taxed). */
export type CapacityStateAfter = MorningMood;

const BASE_COST: Record<TaskIntensity, number> = {
  [TaskIntensity.DeepFocus]: 15,
  [TaskIntensity.Routine]: 10,
  [TaskIntensity.QuickWin]: 5,
  [TaskIntensity.Meeting]: 5,
};

const MULTIPLIER: Record<CapacityStateAfter, number> = {
  [MorningMood.Fresh]: 0.8,
  [MorningMood.Neutral]: 1,
  [MorningMood.Tired]: 1,
  [MorningMood.Taxed]: 1.2,
};

/**
 * Compute energy deduction (points) for a completed task.
 * Base cost by task intensity; multiplier by post-task capacity state.
 */
export function computeEnergyDeduction(
  intensity: TaskIntensity,
  capacityStateAfter: CapacityStateAfter,
): number {
  const base = BASE_COST[intensity] ?? 5;
  const mult = MULTIPLIER[capacityStateAfter] ?? 1;
  return Math.round(base * mult);
}
