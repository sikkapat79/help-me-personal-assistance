import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add sleep_notes to daily_check_in for optional user description of previous night / last sleep.
 */
export class AddSleepNotesToDailyCheckIn1770100000000 implements MigrationInterface {
  name = 'AddSleepNotesToDailyCheckIn1770100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "daily_check_in"
      ADD COLUMN "sleep_notes" text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "daily_check_in"
      DROP COLUMN "sleep_notes"
    `);
  }
}
