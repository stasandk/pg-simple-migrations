-- ##############################
-- #         MIGRATIONS        #
-- ##############################

CREATE TABLE IF NOT EXISTS migrations (
  id serial PRIMARY KEY,
  filename TEXT UNIQUE,
  checksum TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
