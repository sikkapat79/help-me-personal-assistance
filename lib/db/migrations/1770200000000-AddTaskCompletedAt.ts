import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add completed_at to task to record when the user marked it done.
 */
export class AddTaskCompletedAt1770200000000 implements MigrationInterface {
  name = 'AddTaskCompletedAt1770200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "task"
      ADD COLUMN "completed_at" timestamptz
    `);
    await queryRunner.query(`
      UPDATE "task"
      SET "completed_at" = "updated_at"
      WHERE "status" = 'Completed'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "task"
      DROP COLUMN "completed_at"
    `);
  }
}
