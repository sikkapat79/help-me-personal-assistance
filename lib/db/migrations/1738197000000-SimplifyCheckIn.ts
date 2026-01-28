import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Simplify daily check-in to only sleep quality and mood
 * Remove sleep_hours and notes columns
 */
export class SimplifyCheckIn1738197000000 implements MigrationInterface {
  name = 'SimplifyCheckIn1738197000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove sleep_hours column
    await queryRunner.query(`
      ALTER TABLE "daily_check_in"
      DROP COLUMN IF EXISTS "sleep_hours"
    `);

    // Remove notes column
    await queryRunner.query(`
      ALTER TABLE "daily_check_in"
      DROP COLUMN IF EXISTS "notes"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Re-add notes column
    await queryRunner.query(`
      ALTER TABLE "daily_check_in"
      ADD COLUMN "notes" text
    `);

    // Re-add sleep_hours column
    await queryRunner.query(`
      ALTER TABLE "daily_check_in"
      ADD COLUMN "sleep_hours" real NOT NULL DEFAULT 7
    `);
  }
}
