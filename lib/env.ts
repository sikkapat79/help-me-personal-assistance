import "server-only";

import { z } from "zod";

import { AppError } from "@/lib/errors";

const dbEnvSchema = z.object({
  // Avoid deprecated z.string().url() typing surface; validate as a non-empty string.
  // (We can harden this later with a custom URL parser if desired.)
  DATABASE_URL: z.string().min(1),
});

const bedrockEnvSchema = z.object({
  AWS_REGION: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  BEDROCK_MODEL_ID: z.string().min(1),
});

export type DbEnv = z.infer<typeof dbEnvSchema>;
export type BedrockEnv = z.infer<typeof bedrockEnvSchema>;

let cachedDbEnv: DbEnv | undefined;
let cachedBedrockEnv: BedrockEnv | undefined;

export function getDbEnv(): DbEnv {
  if (cachedDbEnv) return cachedDbEnv;
  const parsed = dbEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new AppError("ENV_INVALID", "Invalid database environment variables", {
      cause: parsed.error,
    });
  }
  cachedDbEnv = parsed.data;
  return cachedDbEnv;
}

export function getBedrockEnv(): BedrockEnv {
  if (cachedBedrockEnv) return cachedBedrockEnv;
  const parsed = bedrockEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new AppError("ENV_INVALID", "Invalid Bedrock environment variables", {
      cause: parsed.error,
    });
  }
  cachedBedrockEnv = parsed.data;
  return cachedBedrockEnv;
}

