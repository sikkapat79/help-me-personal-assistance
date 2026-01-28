# TypeORM Migrations

## Migration from MikroORM

This project has been migrated from MikroORM to TypeORM. The existing database schema remains unchanged.

### Legacy Migrations

The old MikroORM migration files have been removed to prevent build errors (they imported from `@mikro-orm/migrations` which is no longer installed).

The complete schema is now documented in the TypeORM migration: `1738108800000-InitialSchema.ts`

### TypeORM Migrations

**Current migration:**
- `1738108800000-InitialSchema.ts` - Complete database schema (task + user_profile tables, indexes, foreign keys)

This migration documents the existing schema in TypeORM format. If you run this on:
- **Existing database**: Will detect tables already exist and mark as executed
- **Fresh database**: Will create all tables, indexes, and constraints

### Current Database Schema

The database currently has the following tables:
- `user_profile`: User profile information
- `task`: Task management with foreign key to user_profile
- `typeorm_migrations`: TypeORM migration tracking table (created automatically)

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
