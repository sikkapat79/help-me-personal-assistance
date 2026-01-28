import 'reflect-metadata';

import { MikroORM } from '@mikro-orm/core';
type OrmCache = {
  ormPromise: Promise<MikroORM>;
};

declare global {
  var __mikroOrmCache: OrmCache | undefined;
}

async function initOrm(): Promise<MikroORM> {
  // Lazy-load config so DB env is only read at runtime (not at import/build time).
  const { getOrmConfig } = await import('@/lib/db/orm-config');
  return MikroORM.init(getOrmConfig());
}

export async function getOrm(): Promise<MikroORM> {
  globalThis.__mikroOrmCache ??= { ormPromise: initOrm() };
  return globalThis.__mikroOrmCache.ormPromise;
}

export async function getEntityManager() {
  const orm = await getOrm();
  // Fork EM per call to avoid cross-request identity map leakage.
  return orm.em.fork({ clear: true });
}
