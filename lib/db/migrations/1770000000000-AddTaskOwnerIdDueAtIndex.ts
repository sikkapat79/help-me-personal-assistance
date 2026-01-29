import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add task_owner_id_due_at_idx on task(owner_id, due_at).
 * Supports "today + overdue" filtered queries and ORDER BY due_at ASC.
 */
export class AddTaskOwnerIdDueAtIndex1770000000000 implements MigrationInterface {
  name = 'AddTaskOwnerIdDueAtIndex1770000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "task_owner_id_due_at_idx"
      ON "task" ("owner_id", "due_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "task_owner_id_due_at_idx"
    `);
  }
}
