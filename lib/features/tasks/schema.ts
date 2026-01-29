import { z } from 'zod';

import { zOptionalStringToNull } from '@/lib/validation/strings';

// TypeScript enums for domain types (explicit, refactorable, iterable)
export enum TaskIntensity {
  DeepFocus = 'DeepFocus',
  Routine = 'Routine',
  QuickWin = 'QuickWin',
  Meeting = 'Meeting',
}

export enum TaskStatus {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

// Zod schemas use nativeEnum for validation
export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Task title is required')
    .max(200, 'Title is too long'),
  description: zOptionalStringToNull().transform((val) => val ?? null),
  intensity: z.enum(TaskIntensity).default(TaskIntensity.QuickWin),
  dueAt: z
    .string()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
  tags: z
    .string()
    .optional()
    .default('')
    .transform((val) =>
      val
        ? val
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
        : [],
    ),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = createTaskSchema.extend({
  taskId: z.string().uuid(),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
