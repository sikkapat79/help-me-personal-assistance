import { AppError } from '@/lib/errors';

type DbEnvParsed = {
  host: string;
  port: number;
  user: string;
  password: string;
  dbName: string;
};

type BedrockEnvParsed = {
  AWS_REGION: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  BEDROCK_MODEL_ID: string;
};

export type DbEnv = DbEnvParsed;
export type BedrockEnv = BedrockEnvParsed;

let cachedDbEnv: DbEnv | undefined;
let cachedBedrockEnv: BedrockEnv | undefined;

function requireEnvString(key: string): string {
  const value = process.env[key];
  if (typeof value === 'string' && value.trim().length > 0) return value;

  throw new AppError('ENV_INVALID', `Missing environment variable: ${key}`, {
    cause: { [key]: ['Required'] },
  });
}

export function getDbEnv(): DbEnv {
  if (cachedDbEnv) return cachedDbEnv;

  const databaseUrl = process.env.DATABASE_URL;
  if (typeof databaseUrl === 'string' && databaseUrl.trim().length > 0) {
    const url = new URL(databaseUrl);
    const dbName = url.pathname.slice(1).replace(/\/.*$/, '') || 'postgres';

    cachedDbEnv = {
      host: url.hostname,
      port: url.port ? Number.parseInt(url.port, 10) : 5432,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      dbName,
    };

    return cachedDbEnv;
  }

  const host = requireEnvString('DB_HOST');
  const user = requireEnvString('DB_USER');
  const password = requireEnvString('DB_PASSWORD');
  const dbName = requireEnvString('DB_NAME');
  const portRaw = process.env.DB_PORT;
  const port = portRaw ? Number.parseInt(portRaw, 10) : 5432;

  if (!Number.isFinite(port) || port <= 0) {
    throw new AppError('ENV_INVALID', 'Invalid environment variable: DB_PORT', {
      cause: { DB_PORT: ['Must be a positive integer'] },
    });
  }

  cachedDbEnv = { host, port, user, password, dbName };
  return cachedDbEnv;
}

export function getBedrockEnv(): BedrockEnv {
  if (cachedBedrockEnv) return cachedBedrockEnv;

  cachedBedrockEnv = {
    AWS_REGION: requireEnvString('AWS_REGION'),
    AWS_ACCESS_KEY_ID: requireEnvString('AWS_ACCESS_KEY_ID'),
    AWS_SECRET_ACCESS_KEY: requireEnvString('AWS_SECRET_ACCESS_KEY'),
    BEDROCK_MODEL_ID: requireEnvString('BEDROCK_MODEL_ID'),
  };

  return cachedBedrockEnv;
}
