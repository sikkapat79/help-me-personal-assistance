import { getEntityManager } from '@/lib/db/mikro-orm';
import { Task } from '@/lib/db/entities/Task';
import { TaskStatus } from '@/lib/features/tasks/schema';
import { TaskCard } from './TaskCard';

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

export async function TaskList() {
  const em = await getEntityManager();

  const tasks = await em.find(
    Task,
    { status: { $ne: TaskStatus.Completed } },
    {
      orderBy: [{ dueAt: 'ASC' }, { createdAt: 'DESC' }],
    },
  );

  if (tasks.length === 0) {
    return <EmptyState />;
  }

  // Convert Task entities to plain objects for client component
  const plainTasks = tasks.map((task) => ({
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
    <div id='task-list' className='space-y-3'>
      {plainTasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
