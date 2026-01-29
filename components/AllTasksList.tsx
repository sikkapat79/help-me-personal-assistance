import { ClipboardList } from 'lucide-react';
import { TaskCard } from './TaskCard';
import type { TaskData } from '@/lib/features/tasks/types';

function EmptyState() {
  return (
    <div
      id='all-tasks-list-empty'
      className='flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 p-12 dark:border-zinc-800 dark:bg-zinc-900'
    >
      <div className='text-center'>
        <ClipboardList
          className='mx-auto h-10 w-10 text-zinc-400 dark:text-zinc-500'
          aria-hidden
        />
        <h3 className='mt-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50'>
          No tasks yet
        </h3>
        <p className='mt-2 text-sm text-zinc-600 dark:text-zinc-400'>
          Get started by creating your first task
        </p>
      </div>
    </div>
  );
}

export function AllTasksList({
  tasks,
}: Readonly<{ tasks: TaskData[] }>) {
  if (tasks.length === 0) {
    return <EmptyState />;
  }

  return (
    <div id='all-tasks-list' className='space-y-3'>
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
