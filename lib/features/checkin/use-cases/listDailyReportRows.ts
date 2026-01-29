import { Between } from 'typeorm';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import { getRepository } from '@/lib/db/connection';
import { DailyCheckIn } from '@/lib/db/entities/DailyCheckIn';
import { EnergyDeductionEvent } from '@/lib/db/entities/EnergyDeductionEvent';
import { Task } from '@/lib/db/entities/Task';
import { TaskStatus } from '@/lib/features/tasks/schema';
import { getUserProfileById } from '@/lib/features/profile/use-cases/getUserProfileById';
import { getDateStartEndInTimeZone, safeTimeZoneOrUtc } from '@/lib/time';

dayjs.extend(utc);
dayjs.extend(timezone);

export interface DailyReportRow {
  date: string; // YYYY-MM-DD
  restQuality1to10: number;
  energyBudget: number;
  tasksCompletedCount: number;
  energyUsed: number;
  deepFocusCount: number;
}

/**
 * List daily report rows for Trends: check-ins in date range with tasks completed and energy used per day.
 * Uses profile timezone for "completed on date" boundaries.
 */
export async function listDailyReportRows(
  ownerId: string,
  startDate: string, // YYYY-MM-DD
  endDate: string, // YYYY-MM-DD
): Promise<DailyReportRow[]> {
  const profileResult = await getUserProfileById(ownerId);
  const timeZone = profileResult.ok
    ? safeTimeZoneOrUtc(profileResult.data.timeZone ?? 'UTC')
    : 'UTC';

  const checkInRepo = await getRepository(DailyCheckIn);
  const checkIns = await checkInRepo.find({
    where: {
      owner: { id: ownerId },
      checkInDate: Between(startDate, endDate),
    },
    order: { checkInDate: 'ASC' },
  });

  if (checkIns.length === 0) {
    return [];
  }

  const rangeStart = getDateStartEndInTimeZone(timeZone, startDate).start;
  const rangeEnd = getDateStartEndInTimeZone(timeZone, endDate).end;

  const taskRepo = await getRepository(Task);
  const completedInRange = await taskRepo.find({
    where: {
      owner: { id: ownerId },
      status: TaskStatus.Completed,
      completedAt: Between(rangeStart, rangeEnd),
    },
    select: ['completedAt', 'intensity'],
  });

  const eventRepo = await getRepository(EnergyDeductionEvent);
  const eventsInRange = await eventRepo.find({
    where: {
      owner: { id: ownerId },
      planDate: Between(startDate, endDate),
    },
    select: ['planDate', 'deductedAmount'],
  });

  const tasksByDate: Record<string, { count: number; deepFocusCount: number }> =
    {};
  for (const t of completedInRange) {
    const at = t.completedAt;
    if (!at) continue;
    const dateStr = dayjs(at).tz(timeZone).format('YYYY-MM-DD');
    if (!tasksByDate[dateStr]) {
      tasksByDate[dateStr] = { count: 0, deepFocusCount: 0 };
    }
    tasksByDate[dateStr].count += 1;
    if (t.intensity === 'DeepFocus') {
      tasksByDate[dateStr].deepFocusCount += 1;
    }
  }

  const energyByDate: Record<string, number> = {};
  for (const e of eventsInRange) {
    const d = e.planDate;
    energyByDate[d] = (energyByDate[d] ?? 0) + e.deductedAmount;
  }

  const rows: DailyReportRow[] = checkIns.map((c) => {
    const taskStats = tasksByDate[c.checkInDate] ?? {
      count: 0,
      deepFocusCount: 0,
    };
    return {
      date: c.checkInDate,
      restQuality1to10: c.restQuality1to10,
      energyBudget: c.energyBudget,
      tasksCompletedCount: taskStats.count,
      energyUsed: energyByDate[c.checkInDate] ?? 0,
      deepFocusCount: taskStats.deepFocusCount,
    };
  });

  return rows;
}
