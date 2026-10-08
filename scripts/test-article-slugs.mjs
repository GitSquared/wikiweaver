import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { neon } from '@neondatabase/serverless';

// Uses only a temporary table, automatically removed at transaction completion.
const sql = neon(process.env.DATABASE_URL);
const migration = await readFile(
	new URL('../drizzle/0000_universe_article_slugs.sql', import.meta.url),
	'utf8',
);
const statements = migration
	.replace(/^--.*$/gm, '')
	.replace(/\barticles\b/g, 'article_slug_regression')
	.split(';')
	.map((statement) => statement.trim())
	.filter((statement) => statement && !/^(BEGIN|COMMIT)$/.test(statement));

const results = await sql.transaction([
	sql.query(`CREATE TEMP TABLE article_slug_regression (
		"universeId" uuid NOT NULL,
		slug text NOT NULL,
		CONSTRAINT articles_slug_unique UNIQUE (slug)
	) ON COMMIT DROP`),
	sql`INSERT INTO article_slug_regression VALUES
		('00000000-0000-0000-0000-000000000001', 'eldoria')`,
	...statements.map((statement) => sql.query(statement)),
	sql`INSERT INTO article_slug_regression VALUES
		('00000000-0000-0000-0000-000000000002', 'eldoria')
		ON CONFLICT ("universeId", slug) DO NOTHING RETURNING *`,
	sql`INSERT INTO article_slug_regression VALUES
		('00000000-0000-0000-0000-000000000001', 'eldoria')
		ON CONFLICT ("universeId", slug) DO NOTHING RETURNING *`,
	sql`SELECT * FROM article_slug_regression ORDER BY "universeId"`,
]);

assert.equal(results.at(-3).length, 1, 'Another universe can save Eldoria');
assert.equal(results.at(-2).length, 0, 'Same-universe race is ignored');
assert.equal(
	results.at(-1).length,
	2,
	'Existing article survives the migration',
);
console.log(
	'PASS: cross-universe slugs, same-universe conflicts, existing data preserved',
);
