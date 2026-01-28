import type { ValidationDemoInput } from "./schema";

export type ValidationDemoFormState = {
  ok: boolean;
  message?: string;
  formError?: string;
  fieldErrors?: Partial<Record<keyof ValidationDemoInput, string>>;
  values?: Partial<ValidationDemoInput>;
};

