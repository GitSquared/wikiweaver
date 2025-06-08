import { index, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { articles } from './article';

export const paragraphs = pgTable(
	'paragraphs',
	{
		id: uuid().defaultRandom().primaryKey(),
		articleId: uuid()
			.references(() => articles.id, { onDelete: 'cascade' })
			.notNull(),
		text: text().notNull(),
	},
	(table) => [
		index('paragraph_search_idx')
			.using('bm25', table.id, table.text)
			.with({ key_field: table.id.name }),
	],
);

export type Paragraph = typeof paragraphs.$inferSelect;
