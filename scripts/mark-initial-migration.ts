#!/usr/bin/env tsx
/**
 * Mark InitialSchema migration as already executed
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// Load .env.local
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
}

import 'reflect-metadata';
import { AppDataSource } from '../lib/db/typeorm-config';

async function markMigration() {
  try {
    await AppDataSource.initialize();
    console.log('✓ Database connected');

    await AppDataSource.query(`
      INSERT INTO typeorm_migrations (timestamp, name)
      VALUES (1738108800000, 'InitialSchema1738108800000')
      ON CONFLICT DO NOTHING
    `);

    console.log('✓ Marked InitialSchema1738108800000 as executed');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('✗ Failed:', error);
    process.exit(1);
  }
}

markMigration();
