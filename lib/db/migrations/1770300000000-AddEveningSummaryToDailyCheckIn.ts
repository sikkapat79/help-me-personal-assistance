import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add evening_summary to daily_check_in for AI-generated end-of-day summary (what went well or bad).
 */
export class AddEveningSummaryToDailyCheckIn1770300000000 implements MigrationInterface {
  name = 'AddEveningSummaryToDailyCheckIn1770300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "daily_check_in"
      ADD COLUMN IF NOT EXISTS "evening_summary" text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "daily_check_in"
      DROP COLUMN IF EXISTS "evening_summary"
    `);
  }
}
