import { Migration } from '@mikro-orm/migrations';

export class Migration20260128100000_add_user_profile extends Migration {
  override async up(): Promise<void> {
    // Create user_profile table
    this.addSql(`
      create table "user_profile" (
        "id" uuid primary key default gen_random_uuid(),
        "display_name" varchar(255) not null,
        "role" varchar(255) not null,
        "bio" text null,
        "working_start_minutes" integer not null,
        "working_end_minutes" integer not null,
        "primary_focus_period" varchar(50) not null,
        "created_at" timestamptz not null,
        "updated_at" timestamptz not null
      );
    `);

    // Insert a default profile for existing data
    this.addSql(`
      insert into "user_profile" (
        "display_name",
        "role",
        "bio",
        "working_start_minutes",
        "working_end_minutes",
        "primary_focus_period",
        "created_at",
        "updated_at"
      ) values (
        'Default User',
        'User',
        null,
        540,
        1080,
        'Morning',
        now(),
        now()
      );
    `);

    // Add owner_id column to task table (nullable initially for backfill)
    this.addSql(`
      alter table "task" add column "owner_id" uuid null;
    `);

    // Backfill owner_id with the default profile
    this.addSql(`
      update "task"
      set "owner_id" = (select "id" from "user_profile" limit 1)
      where "owner_id" is null;
    `);

    // Make owner_id NOT NULL and add foreign key constraint
    this.addSql(`
      alter table "task" alter column "owner_id" set not null;
    `);

    this.addSql(`
      alter table "task" add constraint "task_owner_id_foreign"
      foreign key ("owner_id") references "user_profile" ("id")
      on update cascade on delete restrict;
    `);

    // Add index for owner_id lookups
    this.addSql(`
      create index "task_owner_id_index" on "task" ("owner_id");
    `);
  }

  override async down(): Promise<void> {
    // Drop foreign key and index
    this.addSql(`
      alter table "task" drop constraint if exists "task_owner_id_foreign";
    `);

    this.addSql(`
      drop index if exists "task_owner_id_index";
    `);

    // Drop owner_id column
    this.addSql(`
      alter table "task" drop column "owner_id";
    `);

    // Drop user_profile table
    this.addSql(`
      drop table if exists "user_profile" cascade;
    `);
  }
}
