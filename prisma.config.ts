import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Load from .env.local for Next.js projects
config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
