-- Run only after the lakebase_text deployment has soaked in production and
-- exact plus typo-tolerant search results have been verified.

DROP INDEX IF EXISTS "paragraph_search_idx";
DROP EXTENSION IF EXISTS pg_search;

VACUUM ANALYZE "paragraphs";
