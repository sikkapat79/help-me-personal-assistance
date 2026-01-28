# TypeORM Migrations

## Migration from MikroORM

This project has been migrated from MikroORM to TypeORM. The existing database schema remains unchanged.

### Old MikroORM Migrations (Reference Only)

The following MikroORM migration files are kept for reference:
- `Migration20260128000000_create_task_table.ts`
- `Migration20260128000100_add_task_status_index.ts`
- `Migration20260128100000_add_user_profile.ts`

These migrations have already been applied to the database and should not be run again.

### Current Database Schema

The database currently has the following tables:
- `user_profile`: User profile information
- `task`: Task management with foreign key to user_profile
- `typeorm_migrations`: TypeORM migration tracking table (will be created on first run)

### Creating New Migrations

To create a new migration after making entity changes:

```bash
pnpm db:migration:generate -- lib/db/migrations/MigrationName
```

To run pending migrations:

```bash
pnpm db:migrate:run
```

### Initial Setup (After installing TypeORM)

Since the database schema already exists and matches the current entities, TypeORM will automatically recognize this on first connection. The migration system will create the `typeorm_migrations` table to track future migrations.
