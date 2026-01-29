import { TaskCard } from './TaskCard';
import type { TaskData } from '@/lib/features/tasks/types';

export function NoDateSection({
  tasks,
}: Readonly<{ tasks: TaskData[] }>) {
  return (
    <section
      id='no-date-section'
      className='space-y-3 border-t border-zinc-200 pt-6 dark:border-zinc-800'
    >
      <h2 className='text-lg font-semibold text-foreground'>
        No date{' '}
        <span className='font-normal text-muted-foreground'>
          ({tasks.length})
        </span>
      </h2>
      {tasks.length === 0 ? (
        <p className='rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'>
          No undated tasks.
        </p>
      ) : (
        <div className='space-y-3'>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </section>
  );
}
