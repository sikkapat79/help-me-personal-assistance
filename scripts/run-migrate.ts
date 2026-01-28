import 'reflect-metadata';

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { MikroORM } from '@mikro-orm/core';

// Load .env.local so DB_* / DATABASE_URL are set when running outside Next.js.
try {
  const envPath = resolve(process.cwd(), '.env.local');
  const raw = readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const match = /^\s*([A-Za-z_]\w*)\s*=\s*(.*)\s*$/.exec(line);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2]
        .replaceAll(/^(['"])(.*)\1$/g, '$2')
        .trim();
    }
  }
} catch {
  // .env.local optional when vars set elsewhere
}

async function main() {
  const { default: ormConfig } = await import('../mikro-orm.config');
  const orm = await MikroORM.init(ormConfig);
  await orm.migrator.up();
  await orm.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
