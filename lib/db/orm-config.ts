import 'reflect-metadata';

import type { Options } from '@mikro-orm/core';
import { defineConfig } from '@mikro-orm/postgresql';

import { Task } from '@/lib/db/entities/Task';
import { UserProfile } from '@/lib/db/entities/UserProfile';
import { getDbEnv } from '@/lib/env';

export function getOrmConfig(): Options {
  const db = getDbEnv();

  return defineConfig({
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
    entities: [Task, UserProfile],
    migrations: {
      path: 'lib/db/migrations',
    },
    debug: process.env.NODE_ENV !== 'production',
  } satisfies Options);
}
