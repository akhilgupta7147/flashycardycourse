import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env" });
config({ path: ".env.local", override: true });

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  // Only manage the public schema; leave Neon-managed schemas (e.g. neon_auth) untouched.
  schemaFilter: ["public"],
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
