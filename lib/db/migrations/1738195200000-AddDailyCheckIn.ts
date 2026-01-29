import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add daily_check_in table for Morning Check-in feature
 *
 * Stores one check-in per profile per day with sleep, mood, rest quality, and energy budget.
 */
export class AddDailyCheckIn1738195200000 implements MigrationInterface {
  name = 'AddDailyCheckIn1738195200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create daily_check_in table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "daily_check_in" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "owner_id" uuid NOT NULL,
        "check_in_date" date NOT NULL,
        "sleep_hours" real NOT NULL,
        "morning_mood" varchar(50) NOT NULL,
        "rest_quality_1to10" integer NOT NULL,
        "notes" text,
        "energy_budget" integer NOT NULL,
        "created_at" timestamptz NOT NULL,
        "updated_at" timestamptz NOT NULL
      )
    `);

    // Create unique constraint on (owner_id, check_in_date)
    await queryRunner.query(`
      ALTER TABLE "daily_check_in"
      ADD CONSTRAINT "daily_check_in_owner_id_check_in_date_unique"
      UNIQUE ("owner_id", "check_in_date")
    `);

    // Create index on (owner_id, check_in_date) for fast lookup
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "daily_check_in_owner_id_check_in_date_idx"
      ON "daily_check_in" ("owner_id", "check_in_date")
    `);

    // Create foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "daily_check_in"
      ADD CONSTRAINT "daily_check_in_owner_id_foreign"
      FOREIGN KEY ("owner_id")
      REFERENCES "user_profile" ("id")
      ON UPDATE CASCADE
      ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key
    await queryRunner.query(`
      ALTER TABLE "daily_check_in" DROP CONSTRAINT IF EXISTS "daily_check_in_owner_id_foreign"
    `);

    // Drop index
    await queryRunner.query(`DROP INDEX IF EXISTS "daily_check_in_owner_id_check_in_date_idx"`);

    // Drop unique constraint
    await queryRunner.query(`
      ALTER TABLE "daily_check_in" DROP CONSTRAINT IF EXISTS "daily_check_in_owner_id_check_in_date_unique"
    `);

    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS "daily_check_in" CASCADE`);
  }
}
