'use client';

import { useTransition, useOptimistic } from 'react';
import type { TaskData } from '@/lib/features/tasks/types';
import { TaskIntensity, TaskStatus } from '@/lib/features/tasks/schema';
import { Checkbox } from '@/components/ui/checkbox';
import { updateTaskStatusAction } from '@/app/_actions/update-task-status';
import { useToast } from '@/lib/hooks/use-toast';

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

export function TaskCard({ task }: Readonly<{ task: TaskData }>) {
  const [isPending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    task.status,
    (_state, newStatus: TaskStatus) => newStatus,
  );
  const toast = useToast();

  const isCompleted = optimisticStatus === TaskStatus.Completed;

  const handleCheckboxChange = (checked: boolean) => {
    const newStatus = checked ? TaskStatus.Completed : TaskStatus.Pending;

    startTransition(async () => {
      // Optimistically update the UI immediately
      setOptimisticStatus(newStatus);

      // Send update to server
      const result = await updateTaskStatusAction(task.id, newStatus);

      if (result.ok) {
        const statusLabel = checked ? 'completed' : 'pending';
        toast.info(`Task marked as ${statusLabel}`, {
          description: task.title,
        });
      } else {
        console.error('Failed to update task status:', result.error);
        toast.error('Failed to update task', {
          description: result.error?.message || 'Could not update task status.',
        });
        // The optimistic update will automatically revert when the component
        // re-renders because task.status hasn't changed on the server
      }
      // On success, the optimistic state will sync with the actual prop
      // when the page refreshes or the component re-renders
    });
  };

  return (
    <div
      id={`task-card-${task.id}`}
      className='rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950'
    >
      <div className='flex items-start gap-3'>
        <Checkbox
          checked={isCompleted}
          onCheckedChange={handleCheckboxChange}
          disabled={isPending}
          className='mt-1'
        />
        <div className='flex-1'>
          <h3
            className={`font-semibold text-zinc-900 dark:text-zinc-50 ${isCompleted ? 'line-through opacity-50' : ''}`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p
              className={`mt-1 text-sm text-zinc-600 dark:text-zinc-400 ${isCompleted ? 'line-through opacity-50' : ''}`}
            >
              {task.description}
            </p>
          )}
          <div className='mt-3 flex flex-wrap items-center gap-2'>
            <IntensityBadge intensity={task.intensity} />
            <StatusBadge status={optimisticStatus} />
            {task.dueAt && (
              <span className='text-xs text-zinc-500 dark:text-zinc-400'>
                Due: {new Date(task.dueAt).toLocaleDateString()}
              </span>
            )}
          </div>
          {task.tags.length > 0 && (
            <div className='mt-2 flex flex-wrap gap-1'>
              {task.tags.map((tag: string) => (
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
