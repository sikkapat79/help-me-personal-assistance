import { EntityManager, EntityTarget, Repository } from 'typeorm';
import { AppDataSource } from './typeorm-config';

let isInitialized = false;

/**
 * Get the initialized DataSource singleton.
 * Initializes on first call, then returns the cached instance.
 */
export async function getDataSource() {
  if (!isInitialized) {
    await AppDataSource.initialize();
    isInitialized = true;
    console.log('[TypeORM] Database connection initialized successfully');
  }
  return AppDataSource;
}

/**
 * Get a repository for a specific entity.
 * @param entity - The entity class
 * @returns Repository instance for the entity
 */
export async function getRepository<Entity>(
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
  if (isInitialized && AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    isInitialized = false;
    console.log('[TypeORM] Database connection closed');
  }
}
