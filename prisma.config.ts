import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrate: {
    connectionString: process.env.DATABASE_URL,
    path: "prisma/migrations",
  }
} as any);