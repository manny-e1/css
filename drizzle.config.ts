import "dotenv/config";
import { type Config, defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: ["./src/db/new-schema.ts", "./src/db/auth-schema.ts"],
  out: "./drizzlenew",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  strict: true,
} as Config);
