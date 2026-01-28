import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initial database schema for TypeORM
 *
 * This migration documents the existing schema that was created with MikroORM.
 * Status: Already applied to database (schema exists)
 *
 * Tables created:
 * - task
 * - user_profile
 *
 * If running on a fresh database, this will create all tables.
 * If running on the existing database, this will be marked as already executed.
 */
export class InitialSchema1738108800000 implements MigrationInterface {
  name = 'InitialSchema1738108800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID generation
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

    // Create user_profile table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_profile" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "display_name" varchar(100) NOT NULL,
        "role" varchar(100) NOT NULL,
        "bio" text,
        "working_start_minutes" integer NOT NULL,
        "working_end_minutes" integer NOT NULL,
        "primary_focus_period" varchar(50) NOT NULL,
        "created_at" timestamptz NOT NULL,
        "updated_at" timestamptz NOT NULL
      )
    `);

    // Create task table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "task" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" varchar(200) NOT NULL,
        "description" text,
        "intensity" varchar(50) NOT NULL,
        "due_at" timestamptz,
        "tags" jsonb NOT NULL DEFAULT '[]',
        "status" varchar(50) NOT NULL,
        "created_at" timestamptz NOT NULL,
        "updated_at" timestamptz NOT NULL,
        "owner_id" uuid NOT NULL
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "task_status_idx" ON "task" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "task_owner_id_index" ON "task" ("owner_id")
    `);

    // Create foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "task"
      ADD CONSTRAINT "task_owner_id_foreign"
      FOREIGN KEY ("owner_id")
      REFERENCES "user_profile" ("id")
      ON UPDATE CASCADE
      ON DELETE RESTRICT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key
    await queryRunner.query(`
      ALTER TABLE "task" DROP CONSTRAINT IF EXISTS "task_owner_id_foreign"
    `);

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "task_owner_id_index"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "task_status_idx"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "task" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_profile" CASCADE`);
  }
}
