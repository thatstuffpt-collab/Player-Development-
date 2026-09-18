import { defineConfig } from "prisma/config";

function databaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  const instance = process.env.CLOUD_SQL_INSTANCE;

  if (user && password && database && instance) {
    const socket = encodeURIComponent(`/cloudsql/${instance}`);
    return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@localhost/${encodeURIComponent(database)}?host=${socket}&schema=public`;
  }

  // Allows Prisma generate/build steps that do not need a live database.
  return "postgresql://placeholder:placeholder@localhost:5432/placeholder";
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl(),
  },
});
