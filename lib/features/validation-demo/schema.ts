import { z } from "zod";

import { zOptionalStringToNull } from "@/lib/validation/strings";

export const validationDemoSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80, "Name is too long"),
  // Example: optional strings should become `null` (not "") after normalization.
  nickname: zOptionalStringToNull()
    .optional()
    .transform((value) => value ?? null),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email is not valid")
    .max(255, "Email is too long"),
  prompt: z
    .string()
    .trim()
    .min(1, "Prompt is required")
    .max(2000, "Prompt is too long"),
});

export type ValidationDemoInput = z.infer<typeof validationDemoSchema>;

