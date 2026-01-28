'use client';

import React, {
  useActionState,
  useState,
  useEffect,
  useRef,
  useTransition,
} from 'react';
import { createTask } from '@/app/_actions/create-task';
import { TaskIntensity } from '@/lib/features/tasks/schema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { TaskFormState } from '@/lib/features/tasks/types';

const initialState: TaskFormState = {
  ok: false,
  fieldErrors: {},
  values: {
    title: '',
    description: null,
    tags: [],
  },
};

function getDateInputDefaultValue(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === 'string' && value.length > 0) {
    return value;
  }

  return new Date().toISOString().slice(0, 10);
}

function FieldError({
  message,
}: Readonly<{ message?: string }>): React.ReactNode | null {
  if (!message) return null;
  return (
    <p className='mt-1 text-sm text-red-600'>{message}</p>
  ) as React.ReactNode;
}

export function TaskCreateModal() {
  const [open, setOpen] = useState(false);
  const [intensity, setIntensity] = useState<string>(TaskIntensity.QuickWin);
  const [state, formAction, isPending] = useActionState(
    createTask,
    initialState,
  );
  const [, startTransition] = useTransition();
  const lastTaskIdRef = useRef<string | undefined>(undefined);
  const formRef = useRef<HTMLFormElement>(null);

  // Close modal on success (using ref to track previous taskId)
  useEffect(() => {
    if (!state.ok) {
      return;
    }

    lastTaskIdRef.current = state.taskId;
    formRef.current?.reset();

    startTransition(() => {
      setOpen(false);
      setIntensity(TaskIntensity.QuickWin);
    });
  }, [state.ok, state.taskId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button id='add-task-button'>Add Task</Button>
      </DialogTrigger>
      <DialogContent id='task-create-modal' className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>New Objective</DialogTitle>
        </DialogHeader>

        <form
          ref={formRef}
          action={formAction}
          id='task-create-form'
          className='space-y-4'
        >
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
              defaultValue={state.values?.title ?? ''}
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
              defaultValue={state.values?.description ?? ''}
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
                  <SelectItem value={TaskIntensity.Routine}>Routine</SelectItem>
                  <SelectItem value={TaskIntensity.DeepFocus}>
                    Deep Focus
                  </SelectItem>
                  <SelectItem value={TaskIntensity.Meeting}>Meeting</SelectItem>
                </SelectContent>
              </Select>
              <FieldError message={state.fieldErrors?.intensity} />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='task-dueAt-input'>Due Date</Label>
              <Input
                id='task-dueAt-input'
                name='dueAt'
                type='date'
                defaultValue={getDateInputDefaultValue(state.values?.dueAt)}
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
              defaultValue={state.values?.tags?.join(', ') ?? ''}
            />
            <FieldError message={state.fieldErrors?.tags} />
          </div>

          <div className='flex justify-end gap-3 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOpen(false)}
              disabled={isPending}
              id='cancel-task-button'
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isPending} id='submit-task-button'>
              {isPending ? 'Creating...' : 'Schedule Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
