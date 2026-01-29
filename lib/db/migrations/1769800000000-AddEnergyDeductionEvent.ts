import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add energy_deduction_event table for event-sourcing post-task energy feedback.
 *
 * Each row is a stamped event: task completed on plan_date with capacity_state_after
 * and deducted_amount. Remaining energy = energyBudget (from daily_check_in) - SUM(deducted_amount).
 */
export class AddEnergyDeductionEvent1769800000000 implements MigrationInterface {
  name = 'AddEnergyDeductionEvent1769800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "energy_deduction_event" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "owner_id" uuid NOT NULL,
        "plan_date" date NOT NULL,
        "task_id" uuid NOT NULL,
        "capacity_state_after" varchar(50) NOT NULL,
        "deducted_amount" integer NOT NULL,
        "task_intensity_snapshot" varchar(50),
        "created_at" timestamptz NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "energy_deduction_event_owner_id_plan_date_idx"
      ON "energy_deduction_event" ("owner_id", "plan_date")
    `);

    await queryRunner.query(`
      ALTER TABLE "energy_deduction_event"
      ADD CONSTRAINT "energy_deduction_event_owner_id_foreign"
      FOREIGN KEY ("owner_id")
      REFERENCES "user_profile" ("id")
      ON UPDATE CASCADE
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "energy_deduction_event"
      ADD CONSTRAINT "energy_deduction_event_task_id_foreign"
      FOREIGN KEY ("task_id")
      REFERENCES "task" ("id")
      ON UPDATE CASCADE
      ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "energy_deduction_event"
      DROP CONSTRAINT IF EXISTS "energy_deduction_event_task_id_foreign"
    `);

    await queryRunner.query(`
      ALTER TABLE "energy_deduction_event"
      DROP CONSTRAINT IF EXISTS "energy_deduction_event_owner_id_foreign"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "energy_deduction_event_owner_id_plan_date_idx"
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "energy_deduction_event" CASCADE
    `);
  }
}
