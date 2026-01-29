import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { getDbEnv } from '@/lib/env';
import { Task } from './entities/Task';
import { UserProfile } from './entities/UserProfile';
import { DailyCheckIn } from './entities/DailyCheckIn';

function getTypeOrmConfig(): DataSourceOptions {
  const dbEnv = getDbEnv();
  const isDevelopment = process.env.NODE_ENV !== 'production';

  // Build connection URL for TypeORM
  const url = `postgresql://${encodeURIComponent(dbEnv.user)}:${encodeURIComponent(dbEnv.password)}@${dbEnv.host}:${dbEnv.port}/${dbEnv.dbName}`;

  return {
    type: 'postgres',
    url,
    ssl: {
      rejectUnauthorized: false, // Required for Neon hosted Postgres
    },
    // Explicitly list entities - required for Next.js/Vercel compatibility
    entities: [Task, UserProfile, DailyCheckIn],
    // Migrations for CLI usage only
    migrations: [__dirname + '/migrations/*.ts'],
    migrationsTableName: 'typeorm_migrations',
    synchronize: false, // Never auto-sync in production
    logging: isDevelopment ? ['query', 'error', 'warn'] : ['error'],

    // Connection pooling configuration
    extra: {
      max: 20, // Maximum number of connections in the pool
      min: 5, // Minimum number of connections in the pool
      idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
      connectionTimeoutMillis: 2000, // Timeout when acquiring connection
    },
  };
}

// Create DataSource instance for CLI usage
export const AppDataSource = new DataSource(getTypeOrmConfig());
