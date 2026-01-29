import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add daily_plan table for deterministic Daily Plan snapshots.
 *
 * Stores one plan per profile per day with energy budget, algorithm version,
 * ranked task ids, and per-task reasoning.
 */
export class AddDailyPlan1769700000000 implements MigrationInterface {
  name = 'AddDailyPlan1769700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "daily_plan" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "owner_id" uuid NOT NULL,
        "plan_date" date NOT NULL,
        "energy_budget" integer NOT NULL,
        "algorithm_version" varchar(50) NOT NULL,
        "ranked_task_ids" jsonb NOT NULL DEFAULT '[]',
        "task_reasoning" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "created_at" timestamptz NOT NULL,
        "updated_at" timestamptz NOT NULL
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "daily_plan"
      ADD CONSTRAINT "daily_plan_owner_id_plan_date_unique"
      UNIQUE ("owner_id", "plan_date")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "daily_plan_owner_id_plan_date_idx"
      ON "daily_plan" ("owner_id", "plan_date")
    `);

    await queryRunner.query(`
      ALTER TABLE "daily_plan"
      ADD CONSTRAINT "daily_plan_owner_id_foreign"
      FOREIGN KEY ("owner_id")
      REFERENCES "user_profile" ("id")
      ON UPDATE CASCADE
      ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "daily_plan"
      DROP CONSTRAINT IF EXISTS "daily_plan_owner_id_foreign"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "daily_plan_owner_id_plan_date_idx"
    `);

    await queryRunner.query(`
      ALTER TABLE "daily_plan"
      DROP CONSTRAINT IF EXISTS "daily_plan_owner_id_plan_date_unique"
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "daily_plan" CASCADE
    `);
  }
}
