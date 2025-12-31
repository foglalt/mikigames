import { getSql } from "./db";

let schemaReady: Promise<void> | null = null;

async function createSchema(): Promise<void> {
  const sql = getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS collections (
      id BIGSERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      location_id TEXT NOT NULL,
      location_name TEXT NOT NULL,
      collectible_id TEXT NOT NULL,
      collectible_content TEXT NOT NULL,
      collectible_author TEXT NOT NULL,
      collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, location_id)
    )
  `;

  await sql`
    ALTER TABLE collections
    DROP COLUMN IF EXISTS collectible_title
  `;
}

export async function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = createSchema();
  }

  try {
    await schemaReady;
  } catch (error) {
    schemaReady = null;
    throw error;
  }
}
