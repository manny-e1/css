import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as authSchema from "@/db/auth-schema";
import * as schema from "@/db/new-schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_SSL === "true" ||
      (process.env.DATABASE_URL ?? "").includes("sslmode=require")
      ? { rejectUnauthorized: false }
      : false,
});

export const db = drizzle(pool, {
  schema: {
    ...schema,
    ...authSchema,
  },
});
