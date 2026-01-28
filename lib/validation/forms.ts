import type { ZodError } from "zod";

export function formDataToObject(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    // For typical forms we expect string values.
    out[key] = typeof value === "string" ? value : value.name;
  }
  return out;
}

export function zodFieldErrors(error: ZodError): Record<string, string> {
  // Avoid deprecated flatten() typing surface; map issues directly.
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field !== "string") continue;
    if (out[field]) continue;
    out[field] = issue.message || "Invalid value";
  }
  return out;
}

