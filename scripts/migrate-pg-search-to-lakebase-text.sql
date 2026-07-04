-- Additive phase of the pg_search -> lakebase_text migration.
--
-- Prerequisite: enable Lakebase Search for the Neon project and restart the
-- compute. Keep pg_search installed until the application has soaked on the
-- new backend and search results have been verified.

CREATE EXTENSION IF NOT EXISTS lakebase_text;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE "paragraphs"
	ADD COLUMN IF NOT EXISTS "searchTsv" tsvector
	GENERATED ALWAYS AS (
		to_tsvector('english', coalesce("text", ''))
	) STORED;

CREATE INDEX IF NOT EXISTS "paragraph_search_lakebase_idx"
	ON "paragraphs" USING lakebase_bm25 ("searchTsv");

CREATE INDEX IF NOT EXISTS "paragraph_text_trgm_idx"
	ON "paragraphs" USING gist ("text" gist_trgm_ops);

VACUUM ANALYZE "paragraphs";
