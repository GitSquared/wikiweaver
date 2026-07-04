# Migrate Wikiweaver search to lakebase_text

This rollout keeps the existing ParadeDB search available until the replacement
has been verified in production.

## 1. Deploy the compatibility code

Deploy this change without setting `WIKIWEAVER_SEARCH_BACKEND`. Search continues
to use `pg_search`, while the schema records both the old and new indexes.

## 2. Enable Lakebase Search

Enable Lakebase Search for `wikiweaver-db` in Neon. This is a one-time project
change and restarts the compute. Confirm `lakebase_text` appears in
`shared_preload_libraries` before continuing.

## 3. Add the replacement indexes

Run `scripts/migrate-pg-search-to-lakebase-text.sql`. It installs
`lakebase_text` and `pg_trgm`, adds the generated `searchTsv` column, builds the
BM25 and trigram indexes, and refreshes planner statistics. It does not remove
the current `pg_search` extension or index.

## 4. Verify and switch

Compare searches through both implementations, including misspellings. Then set
`WIKIWEAVER_SEARCH_BACKEND=lakebase_text` in Vercel and deploy. The new path uses
BM25 for normal full-text results and falls back to `pg_trgm` only when BM25
returns no matches.

Monitor runtime errors and search behavior before removing the old backend.

## 5. Finish the migration

After the new backend has soaked, run
`scripts/finish-pg-search-migration.sql`, remove the legacy index from the
Drizzle schema and the compatibility query from `src/lib/search.ts`, then restart
the Neon compute. Complete this before Neon removes `pg_search` support on
September 21, 2026.
