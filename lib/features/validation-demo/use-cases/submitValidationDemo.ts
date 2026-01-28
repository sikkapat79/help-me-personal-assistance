import { validationDemoSchema, type ValidationDemoInput } from "../schema";
import type { ValidationDemoFormState } from "../types";

import { formDataToObject, zodFieldErrors } from "@/lib/validation/forms";

const initialValues: Partial<ValidationDemoInput> = {
  name: "",
  email: "",
  prompt: "",
};

export async function submitValidationDemoUseCase(
  formData: FormData,
): Promise<ValidationDemoFormState> {
  const raw = formDataToObject(formData);
  const parsed = validationDemoSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      formError: "Please fix the errors below.",
      fieldErrors: zodFieldErrors(
        parsed.error,
      ) as ValidationDemoFormState["fieldErrors"],
      values: {
        ...initialValues,
        name: raw.name ?? "",
        email: raw.email ?? "",
        prompt: raw.prompt ?? "",
      },
    };
  }

  // In your real app: call Bedrock + DB here (inside this use case).
  return {
    ok: true,
    message: "Validated successfully.",
    values: parsed.data,
  };
}

