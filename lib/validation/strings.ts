import { z } from "zod";

/**
 * Normalize unknown input into a nullable string:
 * - trims
 * - converts empty string to null
 * - returns null for non-string values (except null/undefined)
 */
export function optionalStringToNull(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

/**
 * Zod helper for optional strings that should become `string | null`.
 * Useful for: form inputs that submit "" when untouched.
 */
export function zOptionalStringToNull() {
  return z.preprocess(optionalStringToNull, z.string().nullable());
}

