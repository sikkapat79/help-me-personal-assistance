import "reflect-metadata";

import type { Options } from "@mikro-orm/core";
import { defineConfig } from "@mikro-orm/postgresql";

import { Conversation } from "./lib/db/entities/Conversation";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is required for Mikro-ORM");
}

export default defineConfig({
  clientUrl: DATABASE_URL,
  entities: [Conversation],
  migrations: {
    path: "lib/db/migrations",
  },
  // Vercel/serverless-friendly defaults:
  // - keep debug off by default
  debug: false,
} satisfies Options);

