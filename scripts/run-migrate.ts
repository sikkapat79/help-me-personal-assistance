#!/usr/bin/env tsx
/**
 * Run TypeORM migrations with environment variables loaded from .env.local
 * 
 * Usage: npx tsx scripts/run-migrate.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Load .env.local file manually BEFORE any imports that depend on env vars
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    
    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=');
    
    if (key && value && !process.env[key]) {
      process.env[key] = value;
    }
  });
  console.log('✓ Loaded environment variables from .env.local');
} else {
  console.warn('⚠ No .env.local file found');
}

// Import AFTER env vars are set
import 'reflect-metadata';
import { AppDataSource } from '../lib/db/typeorm-config';

async function runMigrations() {
  try {
    console.log('Initializing database connection...');
    await AppDataSource.initialize();
    console.log('✓ Database connected');

    console.log('Running migrations...');
    const migrations = await AppDataSource.runMigrations();
    
    if (migrations.length === 0) {
      console.log('✓ No pending migrations');
    } else {
      console.log(`✓ Successfully ran ${migrations.length} migration(s):`);
      migrations.forEach((migration) => {
        console.log(`  - ${migration.name}`);
      });
    }

    await AppDataSource.destroy();
    console.log('✓ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
