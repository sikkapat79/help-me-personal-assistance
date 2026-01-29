import {
  EntityManager,
  EntityTarget,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { AppDataSource } from './typeorm-config';

let initializePromise: Promise<typeof AppDataSource> | null = null;

/**
 * Get the initialized DataSource singleton.
 * Initializes on first call, then returns the cached instance.
 * Uses a promise-based guard to prevent concurrent initialization in serverless environments.
 */
export async function getDataSource() {
  if (initializePromise) {
    return initializePromise;
  }

  initializePromise = (async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('[TypeORM] Database connection initialized successfully');
    }
    return AppDataSource;
  })();

  return initializePromise;
}

/**
 * Get a repository for a specific entity.
 * @param entity - The entity class
 * @returns Repository instance for the entity
 */
export async function getRepository<Entity extends ObjectLiteral>(
  entity: EntityTarget<Entity>,
): Promise<Repository<Entity>> {
  const dataSource = await getDataSource();
  return dataSource.getRepository(entity);
}

/**
 * Execute a callback within a database transaction.
 * If the callback throws, the transaction is rolled back.
 *
 * @param operation - Async function that receives an EntityManager
 * @returns The result of the operation
 */
export async function withTransaction<Result>(
  operation: (manager: EntityManager) => Promise<Result>,
): Promise<Result> {
  const dataSource = await getDataSource();
  return dataSource.transaction(operation);
}

/**
 * Close the database connection.
 * Useful for cleanup in tests or graceful shutdown.
 */
export async function closeConnection(): Promise<void> {
  // Wait for any pending initialization to complete
  if (initializePromise) {
    await initializePromise;
  }

  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    initializePromise = null;
    console.log('[TypeORM] Database connection closed');
  }
}
