CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
);
