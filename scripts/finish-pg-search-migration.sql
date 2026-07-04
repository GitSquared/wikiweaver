-- Run only after WIKIWEAVER_SEARCH_BACKEND=lakebase_text has soaked in
-- production and exact plus typo-tolerant search results have been verified.

DROP INDEX IF EXISTS "paragraph_search_idx";
DROP EXTENSION IF EXISTS pg_search;

VACUUM ANALYZE "paragraphs";
