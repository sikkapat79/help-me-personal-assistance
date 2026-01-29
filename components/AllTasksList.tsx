'use client';

import { useState, useTransition } from 'react';
import { ClipboardList, Loader2 } from 'lucide-react';
import { TaskCard } from './TaskCard';
import type { TaskData } from '@/lib/features/tasks/types';
import type { ListTasksCursor } from '@/lib/features/tasks/use-cases/listTasksCursor';
import { loadMoreTasksAction } from '@/app/_actions/load-more-tasks';
import { Button } from '@/components/ui/button';

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
  initialTasks,
  nextCursor,
}: Readonly<{
  initialTasks: TaskData[];
  nextCursor: ListTasksCursor | null;
}>) {
  const [tasks, setTasks] = useState<TaskData[]>(initialTasks);
  const [cursor, setCursor] = useState<ListTasksCursor | null>(nextCursor);
  const [isLoadingMore, startTransition] = useTransition();

  const handleLoadMore = () => {
    if (!cursor || isLoadingMore) return;
    startTransition(async () => {
      const result = await loadMoreTasksAction(cursor);
      if (result.ok) {
        setTasks((prev) => [...prev, ...result.tasks]);
        setCursor(result.nextCursor);
      }
    });
  };

  if (tasks.length === 0) {
    return <EmptyState />;
  }

  return (
    <div id='all-tasks-list' className='space-y-6'>
      <div className='space-y-3'>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
      {cursor && (
        <div className='flex justify-center'>
          <Button
            type='button'
            variant='outline'
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className='min-w-[10rem]'
          >
            {isLoadingMore ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' aria-hidden />
                Loading...
              </>
            ) : (
              <>Load more</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
