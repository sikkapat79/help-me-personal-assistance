import { Between } from 'typeorm';
import { getRepository } from '@/lib/db/connection';
import { Task } from '@/lib/db/entities/Task';
import { TaskStatus } from '@/lib/features/tasks/schema';
import { TaskCard } from './TaskCard';
import { requireActiveProfileId } from '@/lib/features/profile/activeProfile';
import { getUserProfileById } from '@/lib/features/profile/use-cases/getUserProfileById';
import { getTodayStartEndInTimeZone } from '@/lib/time';

export async function DonePanel() {
  const taskRepo = await getRepository(Task);
  const activeProfileId = await requireActiveProfileId();

  const profileResult = await getUserProfileById(activeProfileId);
  const timeZone = profileResult.ok
    ? (profileResult.data.timeZone ?? 'UTC')
    : 'UTC';
  const { start: todayStart, end: todayEnd } =
    getTodayStartEndInTimeZone(timeZone);

  const doneTasks = await taskRepo.find({
    where: {
      owner: { id: activeProfileId },
      status: TaskStatus.Completed,
      updatedAt: Between(todayStart, todayEnd),
    },
    order: { updatedAt: 'DESC' },
  });

  const plainTasks = doneTasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    intensity: task.intensity,
    dueAt: task.dueAt,
    tags: task.tags,
    status: task.status,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  }));

  return (
    <section
      id='done-panel'
      className='space-y-3 border-t border-zinc-200 pt-6 dark:border-zinc-800'
    >
      <h2 className='text-lg font-semibold text-foreground'>
        Done today{' '}
        <span className='font-normal text-muted-foreground'>
          ({plainTasks.length})
        </span>
      </h2>
      {plainTasks.length === 0 ? (
        <p className='rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'>
          No tasks completed yet today.
        </p>
      ) : (
        <div className='space-y-3'>
          {plainTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </section>
  );
}
