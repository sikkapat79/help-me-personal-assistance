'use client';

import { useState, useTransition, useOptimistic } from 'react';
import { Loader2, Pencil } from 'lucide-react';
import type { TaskData } from '@/lib/features/tasks/types';
import { TaskIntensity, TaskStatus } from '@/lib/features/tasks/schema';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { updateTaskStatusAction } from '@/app/_actions/update-task-status';
import { completeTaskWithEnergyAction } from '@/app/_actions/complete-task-with-energy';
import {
  PostTaskEnergyDialog,
  type PostTaskEnergyChoice,
} from '@/components/PostTaskEnergyDialog';
import { TaskFormModal } from '@/components/TaskFormModal';
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

export function TaskCard({
  task,
  priorityIndex,
  reasoning,
}: Readonly<{ task: TaskData; priorityIndex?: number; reasoning?: string }>) {
  const [openEnergyDialog, setOpenEnergyDialog] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    task.status,
    (_state, newStatus: TaskStatus) => newStatus,
  );
  const toast = useToast();

  const isCompleted = optimisticStatus === TaskStatus.Completed;

  const handleCheckboxChange = (checked: boolean) => {
    if (checked) {
      setOpenEnergyDialog(true);
      return;
    }

    startTransition(async () => {
      setOptimisticStatus(TaskStatus.Pending);
      const result = await updateTaskStatusAction(task.id, TaskStatus.Pending);

      if (result.ok) {
        toast.info('Task marked as pending', { description: task.title });
      } else {
        console.error('Failed to update task status:', result.error);
        toast.error('Failed to update task', {
          description: result.error?.message || 'Could not update task status.',
        });
      }
    });
  };

  const handleEnergyChoice = (choice: PostTaskEnergyChoice) => {
    setOpenEnergyDialog(false);

    if (choice === 'Skip') {
      startTransition(async () => {
        setOptimisticStatus(TaskStatus.Completed);
        const result = await updateTaskStatusAction(
          task.id,
          TaskStatus.Completed,
        );
        if (result.ok) {
          toast.info('Task marked as completed', { description: task.title });
        } else {
          toast.error('Failed to complete task', {
            description: result.error?.message ?? 'Could not complete task.',
          });
        }
      });
      return;
    }

    startTransition(async () => {
      setOptimisticStatus(TaskStatus.Completed);
      const result = await completeTaskWithEnergyAction(task.id, choice);

      if (result.ok) {
        const msg = result.data.energyNotTracked
          ? 'Task completed (no check-in today; energy not tracked)'
          : 'Task completed';
        toast.info(msg, { description: task.title });
      } else {
        console.error('Failed to complete task with energy:', result.error);
        toast.error('Failed to complete task', {
          description: result.error?.message ?? 'Could not complete task.',
        });
      }
    });
  };

  return (
    <>
      <TaskFormModal
        open={editOpen}
        onOpenChange={setEditOpen}
        mode='edit'
        task={task}
      />
      <PostTaskEnergyDialog
        open={openEnergyDialog}
        onOpenChange={setOpenEnergyDialog}
        onSelect={handleEnergyChoice}
        taskTitle={task.title}
        isPending={isPending}
      />
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
          {priorityIndex != null && (
            <span
              className='mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
              aria-label={`Priority ${priorityIndex}`}
            >
              {priorityIndex}
            </span>
          )}
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
            {reasoning && (
              <p className='mt-1.5 text-xs text-zinc-500 dark:text-zinc-400'>
                {reasoning}
              </p>
            )}
            <div className='mt-3 flex flex-wrap items-center gap-2'>
              {isPending && (
                <span className='inline-flex items-center gap-1.5 text-xs text-muted-foreground'>
                  <Loader2 className='h-3 w-3 animate-spin' aria-hidden />
                  <span>Saving...</span>
                </span>
              )}
              <IntensityBadge intensity={task.intensity} />
              <StatusBadge status={optimisticStatus} />
              {task.dueAt && (
                <span className='text-xs text-zinc-500 dark:text-zinc-400'>
                  Due:{' '}
                  {new Date(task.dueAt).toLocaleString(undefined, {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </span>
              )}
              {isCompleted && task.completedAt && (
                <span className='text-xs text-zinc-500 dark:text-zinc-400'>
                  Done at{' '}
                  {new Date(task.completedAt).toLocaleString(undefined, {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
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
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='shrink-0'
            aria-label='Edit task'
            onClick={() => setEditOpen(true)}
          >
            <Pencil className='h-4 w-4' aria-hidden />
          </Button>
        </div>
      </div>
    </>
  );
}
