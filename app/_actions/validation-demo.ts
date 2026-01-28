"use server";

import {
  submitValidationDemoUseCase,
} from "@/lib/features/validation-demo/use-cases/submitValidationDemo";
import type { ValidationDemoFormState } from "@/lib/features/validation-demo/types";

export type { ValidationDemoFormState } from "@/lib/features/validation-demo/types";

export async function submitValidationDemo(
  _prevState: ValidationDemoFormState,
  formData: FormData,
): Promise<ValidationDemoFormState> {
  // Server Action is orchestration only; business logic stays in use-cases.
  return submitValidationDemoUseCase(formData);
}

