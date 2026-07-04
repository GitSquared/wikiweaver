# Migrate Wikiweaver search to lakebase_text

This is a one-way application cutover with an easy code rollback. Prepare Neon
first, then merge the pull request and let Vercel deploy it. The old `pg_search`
extension and index remain in place temporarily so reverting the pull request
restores the previous search path.

## 1. Enable Lakebase Search

Enable Lakebase Search for `wikiweaver-db` in Neon. This is a one-time project
change and restarts the compute. Confirm `lakebase_text` appears in
`shared_preload_libraries` before continuing.

## 2. Add the replacement indexes

Run `scripts/migrate-pg-search-to-lakebase-text.sql`. It installs
`lakebase_text` and `pg_trgm`, adds the generated `searchTsv` column, builds the
BM25 and trigram indexes, and refreshes planner statistics. It does not remove
the current `pg_search` extension or index.

Verify the setup before merging:

```sql
SELECT extname FROM pg_extension
WHERE extname IN ('lakebase_text', 'pg_search', 'pg_trgm');

SELECT indexname FROM pg_indexes
WHERE tablename = 'paragraphs'
ORDER BY indexname;
```

The results should include `lakebase_text`, `pg_trgm`,
`paragraph_search_lakebase_idx`, and `paragraph_search_trgm_idx`.

## 3. Merge and deploy

Merge the pull request. Vercel's automatic production deployment switches search
to Lakebase BM25. The new path falls back to `pg_trgm` only when BM25 returns no
matches, preserving typo-tolerant search without an environment-variable switch.

Smoke-test a normal search and a misspelled search after deployment.

## Roll back

If production search fails, revert the pull request and let Vercel redeploy. The
old `pg_search` extension and `paragraph_search_idx` are intentionally still
present, so no database rollback is needed.

## 4. Finish the migration later

After the new backend has soaked, run
`scripts/finish-pg-search-migration.sql`, remove the legacy index from the
Drizzle schema, then restart the Neon compute. Complete this before Neon removes
`pg_search` support on September 21, 2026.
