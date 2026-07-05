import { sql } from 'drizzle-orm';
import { customType, index, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { articles } from './article';

const tsvector = customType<{ data: string }>({
	dataType() {
		return 'tsvector';
	},
});

export const paragraphs = pgTable(
	'paragraphs',
	{
		id: uuid().defaultRandom().primaryKey(),
		articleId: uuid()
			.references(() => articles.id, { onDelete: 'cascade' })
			.notNull(),
		text: text().notNull(),
		searchTsv: tsvector().generatedAlwaysAs(
			sql`to_tsvector('english', coalesce("text", ''))`,
		),
	},
	(table) => [
		// Keep the ParadeDB index during the additive migration. A later cleanup can
		// remove it after lakebase_text has soaked in production.
		index('paragraph_search_idx')
			.using('bm25', table.id, table.text)
			.with({ key_field: table.id.name }),
		index('paragraph_search_lakebase_idx').using(
			'lakebase_bm25',
			table.searchTsv,
		),
		index('paragraph_text_trgm_idx').using(
			'gist',
			table.text.op('gist_trgm_ops'),
		),
	],
);

export type Paragraph = typeof paragraphs.$inferSelect;
