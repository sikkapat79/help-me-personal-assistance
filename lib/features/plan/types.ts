import { DailyPlan } from '@/lib/db/entities/DailyPlan';

export interface DailyPlanData {
  id: string;
  planDate: string;
  energyBudget: number;
  algorithmVersion: string;
  rankedTaskIds: string[];
  taskReasoning: Record<string, string>;
  reasoningSummary: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function toDailyPlanData(plan: DailyPlan): DailyPlanData {
  return {
    id: plan.id,
    planDate: plan.planDate,
    energyBudget: plan.energyBudget,
    algorithmVersion: plan.algorithmVersion,
    rankedTaskIds: plan.rankedTaskIds,
    taskReasoning: plan.taskReasoning,
    reasoningSummary: plan.reasoningSummary,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  };
}
