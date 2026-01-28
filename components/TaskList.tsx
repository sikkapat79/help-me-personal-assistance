import { getEntityManager } from '@/lib/db/mikro-orm';
import { Task } from '@/lib/db/entities/Task';
import { TaskIntensity, TaskStatus } from '@/lib/features/tasks/schema';

function IntensityBadge({ intensity }: Readonly<{ intensity: TaskIntensity }>) {
  const styles = {
    [TaskIntensity.QuickWin]:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
    [TaskIntensity.Routine]:
      'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    [TaskIntensity.DeepFocus]:
      'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    [TaskIntensity.Meeting]:
      'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  };

  const labels = {
    [TaskIntensity.QuickWin]: 'Quick Win',
    [TaskIntensity.Routine]: 'Routine',
    [TaskIntensity.DeepFocus]: 'Deep Focus',
    [TaskIntensity.Meeting]: 'Meeting',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[intensity]}`}
    >
      {labels[intensity]}
    </span>
  );
}

function StatusBadge({ status }: Readonly<{ status: TaskStatus }>) {
  const styles = {
    [TaskStatus.Pending]:
      'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
    [TaskStatus.InProgress]:
      'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    [TaskStatus.Completed]:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
    [TaskStatus.Cancelled]:
      'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  };

  const labels = {
    [TaskStatus.Pending]: 'Pending',
    [TaskStatus.InProgress]: 'In Progress',
    [TaskStatus.Completed]: 'Completed',
    [TaskStatus.Cancelled]: 'Cancelled',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function TaskCard({ task }: Readonly<{ task: Task }>) {
  return (
    <div
      id={`task-card-${task.id}`}
      className='rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950'
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='flex-1'>
          <h3 className='font-semibold text-zinc-900 dark:text-zinc-50'>
            {task.title}
          </h3>
          {task.description && (
            <p className='mt-1 text-sm text-zinc-600 dark:text-zinc-400'>
              {task.description}
            </p>
          )}
          <div className='mt-3 flex flex-wrap items-center gap-2'>
            <IntensityBadge intensity={task.intensity} />
            <StatusBadge status={task.status} />
            {task.dueAt && (
              <span className='text-xs text-zinc-500 dark:text-zinc-400'>
                Due: {new Date(task.dueAt).toLocaleDateString()}
              </span>
            )}
          </div>
          {task.tags.length > 0 && (
            <div className='mt-2 flex flex-wrap gap-1'>
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className='inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
  console.log('🚀 ~ TaskList ~ tasks:', tasks);

  if (tasks.length === 0) {
    return <EmptyState />;
  }

  return (
    <div id='task-list' className='space-y-3'>
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
