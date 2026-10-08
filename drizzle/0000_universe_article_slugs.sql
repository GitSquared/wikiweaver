-- Apply before deploying the matching application change. Existing articles are preserved.
BEGIN;
SET LOCAL lock_timeout = '5s';
ALTER TABLE articles ADD CONSTRAINT articles_universe_id_slug_unique UNIQUE ("universeId", slug);
ALTER TABLE articles DROP CONSTRAINT articles_slug_unique;
COMMIT;
