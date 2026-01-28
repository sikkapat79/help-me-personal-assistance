-- One-off: create task table (same as Migration20260128000000_create_task_table).
-- Run this in Neon SQL Editor if db:migrate:run is not available.
create extension if not exists pgcrypto;

create table if not exists "task" (
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
