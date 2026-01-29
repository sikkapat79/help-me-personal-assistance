import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add timezone + morning poke time to user_profile.
 *
 * - time_zone: IANA timezone string (e.g. Asia/Bangkok)
 * - morning_poke_time_minutes: minutes since midnight (0-1439), default 08:00 (480)
 */
export class AddUserProfileTimezoneAndPokeTime1769648226191 implements MigrationInterface {
  name = 'AddUserProfileTimezoneAndPokeTime1769648226191';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_profile"
      ADD COLUMN IF NOT EXISTS "time_zone" varchar(64) NOT NULL DEFAULT 'UTC'
    `);

    await queryRunner.query(`
      ALTER TABLE "user_profile"
      ADD COLUMN IF NOT EXISTS "morning_poke_time_minutes" integer NOT NULL DEFAULT 480
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_profile"
      DROP COLUMN IF EXISTS "morning_poke_time_minutes"
    `);

    await queryRunner.query(`
      ALTER TABLE "user_profile"
      DROP COLUMN IF EXISTS "time_zone"
    `);
  }
}
