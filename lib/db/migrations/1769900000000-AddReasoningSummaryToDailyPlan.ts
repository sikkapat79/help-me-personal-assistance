import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add reasoning_summary (nullable text) to daily_plan for AI summary paragraph.
 * Existing rows stay NULL; no backfill.
 */
export class AddReasoningSummaryToDailyPlan1769900000000 implements MigrationInterface {
  name = 'AddReasoningSummaryToDailyPlan1769900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "daily_plan"
      ADD COLUMN IF NOT EXISTS "reasoning_summary" text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "daily_plan"
      DROP COLUMN IF EXISTS "reasoning_summary"
    `);
  }
}
