import "reflect-metadata";

import { MikroORM } from "@mikro-orm/core";

import ormConfig from "../../mikro-orm.config";

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
  // Reuse a single ORM instance during local dev to reduce connection churn.
  // On Vercel, each function instance may still create its own ORM instance.
  if (process.env.NODE_ENV !== "production") {
    globalThis.__mikroOrmCache ??= { orm: await initOrm() };
    return globalThis.__mikroOrmCache.orm;
  }

  return initOrm();
}

export async function getEntityManager() {
  const orm = await getOrm();
  // Fork EM per call to avoid cross-request identity map leakage.
  return orm.em.fork({ clear: true });
}

