import 'reflect-metadata';

import { MikroORM } from '@mikro-orm/core';

import ormConfig from '../../mikro-orm.config';

type OrmCache = {
  orm: MikroORM;
};

declare global {
  var __mikroOrmCache: OrmCache | undefined;
}

async function initOrm(): Promise<MikroORM> {
  return MikroORM.init(ormConfig);
}

export async function getOrm(): Promise<MikroORM> {
  return initOrm();
}

export async function getEntityManager() {
  const orm = await getOrm();
  // Fork EM per call to avoid cross-request identity map leakage.
  return orm.em.fork({ clear: true });
}
