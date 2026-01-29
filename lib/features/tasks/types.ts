import { CreateTaskInput, TaskIntensity, TaskStatus } from './schema';

export type TaskFormState = {
  ok: boolean;
  message?: string;
  formError?: string;
  fieldErrors?: Partial<Record<keyof CreateTaskInput, string>>;
  values?: Partial<CreateTaskInput>;
  taskId?: string;
};

// Plain serializable task data for client components
export type TaskData = {
  id: string;
  title: string;
  description: string | null;
  intensity: TaskIntensity;
  dueAt: Date | null;
  tags: string[];
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
};
