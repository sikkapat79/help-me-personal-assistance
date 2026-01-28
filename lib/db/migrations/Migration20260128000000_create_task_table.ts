import { Migration } from '@mikro-orm/migrations';

export class Migration20260128000000_create_task_table extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      create extension if not exists pgcrypto;

      create table "task" (
        "id" uuid primary key default gen_random_uuid(),
        "title" varchar(255) not null,
        "description" text null,
        "intensity" varchar(50) not null,
        "due_at" timestamptz null,
        "tags" jsonb not null default '[]',
        "status" varchar(50) not null,
        "created_at" timestamptz not null,
        "updated_at" timestamptz not null
      );
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "task" cascade;`);
  }
}
