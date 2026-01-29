import { Not } from 'typeorm';
import { getRepository } from '@/lib/db/connection';
import { Task } from '@/lib/db/entities/Task';
import { TaskStatus } from '@/lib/features/tasks/schema';
import { TaskCard } from './TaskCard';
import { requireActiveProfileId } from '@/lib/features/profile/activeProfile';
import { getUserProfileById } from '@/lib/features/profile/use-cases/getUserProfileById';
import { getYyyyMmDdInTimeZone, isDueOnOrBefore } from '@/lib/time';
import { getDailyPlanForDate } from '@/lib/features/plan/use-cases/getDailyPlanForDate';

function EmptyState() {
  return (
    <div
      id='task-list-empty'
      className='flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 p-12 dark:border-zinc-800 dark:bg-zinc-900'
    >
      <div className='text-center'>
        <h3 className='text-lg font-semibold text-zinc-900 dark:text-zinc-50'>
          No tasks yet
        </h3>
        <p className='mt-2 text-sm text-zinc-600 dark:text-zinc-400'>
          Get started by creating your first task
        </p>
      </div>
    </div>
  );
}

function sortByDueAtThenCreatedAt(a: Task, b: Task): number {
  const aDue = a.dueAt?.getTime() ?? Infinity;
  const bDue = b.dueAt?.getTime() ?? Infinity;
  if (aDue !== bDue) return aDue - bDue;
  return b.createdAt.getTime() - a.createdAt.getTime();
}

export async function TaskList() {
  const taskRepo = await getRepository(Task);
  const activeProfileId = await requireActiveProfileId();

  const profileResult = await getUserProfileById(activeProfileId);
  const timeZone = profileResult.ok
    ? (profileResult.data.timeZone ?? 'UTC')
    : 'UTC';
  const today = getYyyyMmDdInTimeZone(timeZone);

  const [planResult, tasks] = await Promise.all([
    getDailyPlanForDate(activeProfileId, today),
    taskRepo.find({
      where: {
        owner: { id: activeProfileId },
        status: Not(TaskStatus.Completed),
      },
      order: {
        dueAt: 'ASC',
        createdAt: 'DESC',
      },
    }),
  ]);

  const filtered = tasks.filter(
    (t) => t.dueAt != null && isDueOnOrBefore(t.dueAt, today, timeZone),
  );

  if (filtered.length === 0) {
    return <EmptyState />;
  }

  const plan = planResult.ok && planResult.data ? planResult.data : null;
  const rankedIds = plan?.rankedTaskIds ?? [];
  const usePlanOrder = rankedIds.length > 0;

  let orderedTasks: Task[];
  const rankMap = new Map<string, number>();

  if (usePlanOrder) {
    rankedIds.forEach((id, i) => rankMap.set(id, i));
    const inPlan = filtered.filter((t) => rankMap.has(t.id));
    const notInPlan = filtered.filter((t) => !rankMap.has(t.id));
    inPlan.sort((a, b) => (rankMap.get(a.id) ?? 0) - (rankMap.get(b.id) ?? 0));
    notInPlan.sort(sortByDueAtThenCreatedAt);
    orderedTasks = [...inPlan, ...notInPlan];
  } else {
    orderedTasks = filtered;
  }

  const taskReasoning = usePlanOrder ? (plan?.taskReasoning ?? {}) : {};

  const plainTasks = orderedTasks.map((task) => {
    const base = {
      id: task.id,
      title: task.title,
      description: task.description,
      intensity: task.intensity,
      dueAt: task.dueAt,
      tags: task.tags,
      status: task.status,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
    const idx = usePlanOrder ? rankMap.get(task.id) : undefined;
    const priorityIndex = idx === undefined ? undefined : idx + 1;
    const raw = taskReasoning[task.id];
    const reasoning =
      typeof raw === 'string' && raw.trim() ? raw.trim() : undefined;
    return { ...base, priorityIndex, reasoning };
  });

  return (
    <div id='task-list' className='space-y-3'>
      {plainTasks.map(({ priorityIndex, reasoning, ...task }) => (
        <TaskCard
          key={task.id}
          task={task}
          priorityIndex={priorityIndex}
          reasoning={reasoning}
        />
      ))}
    </div>
  );
}
