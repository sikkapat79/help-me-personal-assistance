import { CreateTaskInput } from './schema';

export type TaskFormState = {
  ok: boolean;
  message?: string;
  formError?: string;
  fieldErrors?: Partial<Record<keyof CreateTaskInput, string>>;
  values?: Partial<CreateTaskInput>;
  taskId?: string;
};
