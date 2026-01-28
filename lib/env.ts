import { z } from 'zod';

import { AppError } from '@/lib/errors';

const dbUrlEnvSchema = z.object({
  // Avoid deprecated z.string().url() typing surface; validate as a non-empty string.
  // (We can harden this later with a custom URL parser if desired.)
  DATABASE_URL: z.string().min(1),
});

const dbParamsEnvSchema = z.object({
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().min(1),
});

type DbEnvParsed = {
  host: string;
  port: number;
  user: string;
  password: string;
  dbName: string;
};

const dbEnvSchema = z
  .union([dbUrlEnvSchema, dbParamsEnvSchema])
  .transform((env): DbEnvParsed => {
    if ('DB_HOST' in env) {
      return {
        host: env.DB_HOST,
        port: env.DB_PORT,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        dbName: env.DB_NAME,
      };
    }
    const url = new URL(env.DATABASE_URL);
    const dbName = url.pathname.slice(1).replace(/\/.*$/, '') || 'postgres';
    return {
      host: url.hostname,
      port: url.port ? Number.parseInt(url.port, 10) : 5432,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      dbName,
    };
  });

const bedrockEnvSchema = z.object({
  AWS_REGION: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  BEDROCK_MODEL_ID: z.string().min(1),
});

export type DbEnv = DbEnvParsed;
export type BedrockEnv = z.infer<typeof bedrockEnvSchema>;

let cachedDbEnv: DbEnv | undefined;
let cachedBedrockEnv: BedrockEnv | undefined;

export function getDbEnv(): DbEnv {
  if (cachedDbEnv) return cachedDbEnv;
  const parsed = dbEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new AppError(
      'ENV_INVALID',
      'Invalid database environment variables',
      {
        cause: parsed.error,
      },
    );
  }
  cachedDbEnv = parsed.data;
  return cachedDbEnv;
}

export function getBedrockEnv(): BedrockEnv {
  if (cachedBedrockEnv) return cachedBedrockEnv;
  const parsed = bedrockEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new AppError('ENV_INVALID', 'Invalid Bedrock environment variables', {
      cause: parsed.error,
    });
  }
  cachedBedrockEnv = parsed.data;
  return cachedBedrockEnv;
}
