-- Apply before deploying the generation guard. No existing content is changed.
CREATE TABLE IF NOT EXISTS "generationWindows" (
  "key" text PRIMARY KEY,
  "count" integer NOT NULL DEFAULT 1,
  "expiresAt" timestamptz NOT NULL,
  "category" text NOT NULL,
  "userAgent" text NOT NULL,
  "country" text NOT NULL
);
CREATE INDEX IF NOT EXISTS generation_window_expiry_idx
  ON "generationWindows" ("expiresAt");
