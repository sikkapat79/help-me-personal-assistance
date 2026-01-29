'use client';

import React, {
  useActionState,
  useState,
  useEffect,
  useRef,
  useTransition,
} from 'react';
import { createTask } from '@/app/_actions/create-task';
import { updateTask } from '@/app/_actions/update-task';
import { deleteTaskAction } from '@/app/_actions/delete-task';
import { TaskIntensity, TaskStatus } from '@/lib/features/tasks/schema';
import type { TaskData, TaskFormState } from '@/lib/features/tasks/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/lib/hooks/use-toast';

const initialState: TaskFormState = {
  ok: false,
  fieldErrors: {},
  values: {
    title: '',
    description: null,
    tags: [],
  },
};

/** Format for datetime-local input (YYYY-MM-DDTHH:mm). Returns '' if no value. */
function getDateTimeLocalDefaultValue(value: unknown): string {
  if (value instanceof Date) {
    const d = value;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }
  return '';
}

function FieldError({
  message,
}: Readonly<{ message?: string }>): React.ReactNode | null {
  if (!message) return null;
  return (
    <p className='mt-1 text-sm text-red-600'>{message}</p>
  ) as React.ReactNode;
}

type TaskFormModalProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  task?: TaskData;
}>;

export function TaskFormModal({
  open,
  onOpenChange,
  mode,
  task,
}: TaskFormModalProps) {
  const [intensity, setIntensity] = useState<string>(TaskIntensity.QuickWin);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeletePending, setIsDeletePending] = useState(false);
  const [createState, createAction, isCreatePending] = useActionState(
    createTask,
    initialState,
  );
  const [updateState, updateAction, isUpdatePending] = useActionState(
    updateTask,
    initialState,
  );
  const state = mode === 'create' ? createState : updateState;
  const formAction = mode === 'create' ? createAction : updateAction;
  const isPending =
    mode === 'create' ? isCreatePending : isUpdatePending || isDeletePending;
  const [, startTransition] = useTransition();
  const lastTaskIdRef = useRef<string | undefined>(undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const toast = useToast();

  // Sync intensity when opening (non-blocking to avoid cascading renders)
  useEffect(() => {
    if (open && mode === 'edit' && task) {
      startTransition(() => setIntensity(task.intensity));
    }
    if (open && mode === 'create') {
      startTransition(() => setIntensity(TaskIntensity.QuickWin));
    }
  }, [open, mode, task]);

  // Close modal on success
  useEffect(() => {
    if (!state.ok) {
      if (state.formError) {
        toast.error(
          mode === 'create' ? 'Failed to create task' : 'Failed to update task',
          { description: state.formError },
        );
      }
      return;
    }
    if (lastTaskIdRef.current === state.taskId) {
      return;
    }
    lastTaskIdRef.current = state.taskId;
    formRef.current?.reset();
    toast.success(
      mode === 'create'
        ? 'Task created successfully'
        : 'Task updated successfully',
      {
        description:
          mode === 'create'
            ? 'Your task has been added to the list.'
            : 'Your changes have been saved.',
      },
    );
    startTransition(() => {
      onOpenChange(false);
      setIntensity(TaskIntensity.QuickWin);
    });
  }, [state.ok, state.taskId, state.formError, mode, onOpenChange, toast]);

  // Prefer task data when opening in edit mode; use state.values after validation/server error
  const fromServer = Boolean(
    state.formError || Object.keys(state.fieldErrors ?? {}).length,
  );
  const useTaskDefaults = mode === 'edit' && task && !fromServer;

  let defaultTitle: string;
  let defaultDescription: string;
  let defaultDueAt: Date | string | null;
  let defaultTags: string[] | string;

  if (useTaskDefaults && task) {
    defaultTitle = task.title;
    defaultDescription = task.description ?? '';
    defaultDueAt = task.dueAt;
    defaultTags = task.tags;
  } else {
    const fallbackTitle = mode === 'edit' && task ? task.title : '';
    defaultTitle = state.values?.title ?? fallbackTitle ?? '';
    const fallbackDesc = mode === 'edit' && task ? task.description : null;
    defaultDescription = state.values?.description ?? fallbackDesc ?? '';
    const fallbackDueAt = mode === 'edit' && task ? task.dueAt : null;
    defaultDueAt = state.values?.dueAt ?? fallbackDueAt;
    const fallbackTags = mode === 'edit' && task ? task.tags : [];
    defaultTags = state.values?.tags ?? fallbackTags ?? [];
  }

  let submitLabel: string;
  if (isPending) {
    submitLabel = mode === 'edit' ? 'Saving...' : 'Creating...';
  } else {
    submitLabel = mode === 'edit' ? 'Save changes' : 'Schedule Task';
  }

  const handleDeleteConfirm = async () => {
    if (mode !== 'edit' || !task) return;
    setIsDeletePending(true);
    const result = await deleteTaskAction(task.id);
    setIsDeletePending(false);
    if (result.ok) {
      setDeleteDialogOpen(false);
      onOpenChange(false);
      toast.success('Objective deleted', {
        description: 'The objective has been removed.',
      });
    } else {
      toast.error('Could not delete objective', {
        description: result.error?.message ?? 'Please try again.',
      });
    }
  };

  const canDelete =
    mode === 'edit' && task && task.status !== TaskStatus.Completed;

  return (
    <>
      {canDelete ? (
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete objective?</AlertDialogTitle>
              <AlertDialogDescription>
                This cannot be undone. The objective will be removed from your
                list.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeletePending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type='button'
                onClick={(e) => {
                  e.preventDefault();
                  void handleDeleteConfirm();
                }}
                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                disabled={isDeletePending}
              >
                {isDeletePending ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          id={mode === 'edit' ? 'task-edit-modal' : 'task-create-modal'}
          className='max-w-2xl'
        >
          <DialogHeader>
            <DialogTitle>
              {mode === 'edit' ? 'Edit objective' : 'New Objective'}
            </DialogTitle>
          </DialogHeader>
          <form
            ref={formRef}
            action={formAction}
            id={mode === 'edit' ? 'task-edit-form' : 'task-create-form'}
            className='space-y-4'
            key={
              mode === 'edit' && task
                ? `edit-${open}-${task.id}`
                : `create-${open}`
            }
          >
            {mode === 'edit' && task ? (
              <input type='hidden' name='taskId' value={task.id} />
            ) : null}
            {state.formError ? (
              <div className='rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800'>
                {state.formError}
              </div>
            ) : null}

            <div className='space-y-2'>
              <Label htmlFor='task-title-input'>Project Name</Label>
              <Input
                id='task-title-input'
                name='title'
                defaultValue={defaultTitle}
                placeholder='Enter task title...'
                required
              />
              <FieldError message={state.fieldErrors?.title} />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='task-description-textarea'>
                Brief description or outcome goal
              </Label>
              <Textarea
                id='task-description-textarea'
                name='description'
                defaultValue={
                  typeof defaultDescription === 'string'
                    ? defaultDescription
                    : (defaultDescription ?? '')
                }
                placeholder='Describe what you want to achieve...'
                rows={3}
              />
              <FieldError message={state.fieldErrors?.description} />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='task-intensity-select'>Intensity</Label>
                <Select
                  name='intensity'
                  value={intensity}
                  onValueChange={setIntensity}
                >
                  <SelectTrigger id='task-intensity-select'>
                    <SelectValue placeholder='Select intensity' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TaskIntensity.QuickWin}>
                      Quick Win
                    </SelectItem>
                    <SelectItem value={TaskIntensity.Routine}>
                      Routine
                    </SelectItem>
                    <SelectItem value={TaskIntensity.DeepFocus}>
                      Deep Focus
                    </SelectItem>
                    <SelectItem value={TaskIntensity.Meeting}>
                      Meeting
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FieldError message={state.fieldErrors?.intensity} />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='task-dueAt-input'>Due date & time</Label>
                <Input
                  id='task-dueAt-input'
                  name='dueAt'
                  type='datetime-local'
                  defaultValue={getDateTimeLocalDefaultValue(defaultDueAt)}
                />
                <FieldError message={state.fieldErrors?.dueAt} />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='task-tags-input'>
                Tags{' '}
                <span className='text-xs text-zinc-500'>(comma-separated)</span>
              </Label>
              <Input
                id='task-tags-input'
                name='tags'
                placeholder='e.g., work, urgent, personal'
                defaultValue={
                  Array.isArray(defaultTags)
                    ? defaultTags.join(', ')
                    : (defaultTags ?? '')
                }
              />
              <FieldError message={state.fieldErrors?.tags} />
            </div>

            <div className='flex flex-wrap items-center justify-between gap-3 pt-4'>
              <div className='flex gap-3'>
                {canDelete ? (
                  <Button
                    type='button'
                    variant='ghost'
                    className='text-destructive hover:bg-destructive/10 hover:text-destructive'
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={isPending}
                    id='delete-task-button'
                    aria-label='Delete objective'
                  >
                    Delete objective
                  </Button>
                ) : null}
              </div>
              <div className='flex gap-3'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                  id='cancel-task-button'
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  loading={isPending}
                  id='submit-task-button'
                >
                  {submitLabel}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
