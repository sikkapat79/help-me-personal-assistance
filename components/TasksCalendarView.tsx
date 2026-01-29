'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import type { TaskData } from '@/lib/features/tasks/types';
import { TaskIntensity } from '@/lib/features/tasks/schema';
import { TaskFormModal } from './TaskFormModal';
import { Button } from '@/components/ui/button';

dayjs.extend(utc);
dayjs.extend(timezone);

function toDate(val: Date | string | null): Date | null {
  if (val == null) return null;
  if (val instanceof Date) return val;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d;
}

function sortByDueAtThenCreatedAt(a: TaskData, b: TaskData): number {
  const aDue = a.dueAt ? new Date(a.dueAt).getTime() : Infinity;
  const bDue = b.dueAt ? new Date(b.dueAt).getTime() : Infinity;
  if (aDue !== bDue) return aDue - bDue;
  const aCreated = new Date(a.createdAt).getTime();
  const bCreated = new Date(b.createdAt).getTime();
  return bCreated - aCreated;
}

function groupTasksByDay(
  tasks: TaskData[],
  timeZone: string,
  todayYyyyMmDd: string,
  todayRankedIds?: string[],
): Map<string, TaskData[]> {
  const tz = timeZone?.trim() || 'UTC';
  const byDay = new Map<string, TaskData[]>();
  for (const task of tasks) {
    const d = toDate(task.dueAt);
    if (!d) continue;
    const dayStr = dayjs(d).tz(tz).format('YYYY-MM-DD');
    const list = byDay.get(dayStr) ?? [];
    list.push(task);
    byDay.set(dayStr, list);
  }
  for (const [dayStr, dayTasks] of byDay) {
    const usePlanOrder =
      dayStr === todayYyyyMmDd && (todayRankedIds?.length ?? 0) > 0;
    let ordered: TaskData[];
    if (usePlanOrder && todayRankedIds) {
      const rankMap = new Map<string, number>();
      todayRankedIds.forEach((id, i) => rankMap.set(id, i));
      const inPlan = dayTasks.filter((t) => rankMap.has(t.id));
      const notInPlan = dayTasks.filter((t) => !rankMap.has(t.id));
      inPlan.sort(
        (a, b) => (rankMap.get(a.id) ?? 0) - (rankMap.get(b.id) ?? 0),
      );
      notInPlan.sort(sortByDueAtThenCreatedAt);
      ordered = [...inPlan, ...notInPlan];
    } else {
      ordered = [...dayTasks].sort(sortByDueAtThenCreatedAt);
    }
    byDay.set(dayStr, ordered);
  }
  return byDay;
}

function getWeekDays(initialDate: string, timeZone: string): string[] {
  const tz = timeZone?.trim() || 'UTC';
  const start = dayjs.tz(initialDate, tz).startOf('week');
  return Array.from({ length: 7 }, (_, i) =>
    start.add(i, 'day').format('YYYY-MM-DD'),
  );
}

const intensityCardStyles: Record<TaskIntensity, string> = {
  [TaskIntensity.QuickWin]:
    'border-emerald-200 bg-emerald-50/80 dark:border-emerald-800 dark:bg-emerald-950/50',
  [TaskIntensity.Routine]:
    'border-blue-200 bg-blue-50/80 dark:border-blue-800 dark:bg-blue-950/50',
  [TaskIntensity.DeepFocus]:
    'border-purple-200 bg-purple-50/80 dark:border-purple-800 dark:bg-purple-950/50',
  [TaskIntensity.Meeting]:
    'border-orange-200 bg-orange-50/80 dark:border-orange-800 dark:bg-orange-950/50',
};

function WeekTaskCard({
  task,
  onSelect,
}: Readonly<{ task: TaskData; onSelect: () => void }>) {
  const style =
    intensityCardStyles[task.intensity] ??
    'border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/80';
  return (
    <button
      type='button'
      onClick={onSelect}
      className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${style}`}
    >
      <span className='block truncate font-medium text-foreground'>
        {task.title}
      </span>
    </button>
  );
}

export function TasksCalendarView({
  tasks,
  initialDate,
  timeZone,
  todayYyyyMmDd,
  todayRankedIds,
}: Readonly<{
  tasks: TaskData[];
  initialDate: string;
  timeZone: string;
  todayYyyyMmDd: string;
  todayRankedIds?: string[];
}>) {
  const router = useRouter();
  const [editTask, setEditTask] = useState<TaskData | null>(null);

  const weekDays = useMemo(
    () => getWeekDays(initialDate, timeZone),
    [initialDate, timeZone],
  );
  const tasksByDay = useMemo(
    () => groupTasksByDay(tasks, timeZone, todayYyyyMmDd, todayRankedIds),
    [tasks, timeZone, todayYyyyMmDd, todayRankedIds],
  );

  const goToPrevWeek = () => {
    const prev = dayjs
      .tz(initialDate, timeZone?.trim() || 'UTC')
      .subtract(1, 'week')
      .format('YYYY-MM-DD');
    router.push(`/tasks?view=calendar&calendarDate=${prev}`);
  };

  const goToNextWeek = () => {
    const next = dayjs
      .tz(initialDate, timeZone?.trim() || 'UTC')
      .add(1, 'week')
      .format('YYYY-MM-DD');
    router.push(`/tasks?view=calendar&calendarDate=${next}`);
  };

  const goToToday = () => {
    router.push(`/tasks?view=calendar&calendarDate=${todayYyyyMmDd}`);
  };

  const dayLabels = weekDays.map((dayStr) => {
    const d = dayjs.tz(dayStr, timeZone?.trim() || 'UTC');
    return { dayStr, short: d.format('ddd'), date: d.format('D') };
  });

  return (
    <>
      <TaskFormModal
        open={editTask != null}
        onOpenChange={(open) => !open && setEditTask(null)}
        mode='edit'
        task={editTask ?? undefined}
      />
      <div className='space-y-4'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <h2 className='text-lg font-semibold text-muted-foreground'>
            Strategic Horizon
          </h2>
          <div className='flex items-center gap-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={goToPrevWeek}
              aria-label='Previous week'
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={goToToday}
            >
              Today
            </Button>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={goToNextWeek}
              aria-label='Next week'
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>

        <div className='grid min-h-96 grid-cols-7 gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950'>
          {dayLabels.map(({ dayStr, short, date }) => {
            const isToday = dayStr === todayYyyyMmDd;
            const dayTasks = tasksByDay.get(dayStr) ?? [];
            return (
              <section
                key={dayStr}
                className='flex min-w-0 flex-col rounded-lg border border-zinc-100 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50'
              >
                <header className='border-b border-zinc-200 px-2 py-2 dark:border-zinc-700'>
                  <p
                    className='text-xs font-medium uppercase tracking-wide text-muted-foreground'
                    aria-hidden
                  >
                    {short}
                  </p>
                  <p
                    className={`text-lg font-semibold ${isToday ? 'text-primary' : 'text-foreground'}`}
                  >
                    {date}
                  </p>
                </header>
                <ul className='flex flex-1 flex-col gap-2 overflow-auto p-2'>
                  {dayTasks.map((task) => (
                    <li key={task.id}>
                      <WeekTaskCard
                        task={task}
                        onSelect={() => setEditTask(task)}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
