import 'reflect-metadata';

import type { Options } from '@mikro-orm/core';
import { defineConfig } from '@mikro-orm/postgresql';

import { Task } from '@/lib/db/entities/Task';
import { getDbEnv } from '@/lib/env';

const db = getDbEnv();

export default defineConfig({
  host: db.host,
  port: db.port,
  user: db.user,
  password: db.password,
  dbName: db.dbName,
  driverOptions: {
    connection: {
      ssl: { rejectUnauthorized: false },
    },
  },
  entities: [Task],
  migrations: {
    path: 'lib/db/migrations',
  },
  // Vercel/serverless-friendly defaults:
  // - keep debug off by default
  debug: true,
} satisfies Options);
