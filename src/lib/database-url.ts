const encode = encodeURIComponent;

export function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  const instance = process.env.CLOUD_SQL_INSTANCE;

  if (!user || !password || !database || !instance) {
    throw new Error(
      "Database configuration is incomplete. Set DATABASE_URL or DB_USER, DB_PASSWORD, DB_NAME, and CLOUD_SQL_INSTANCE.",
    );
  }

  const socket = encode(`/cloudsql/${instance}`);
  return `postgresql://${encode(user)}:${encode(password)}@localhost/${encode(database)}?host=${socket}&schema=public`;
}
