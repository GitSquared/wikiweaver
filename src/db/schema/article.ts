import {
	index,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';
import { universes } from './universe';

export const articles = pgTable(
	'articles',
	{
		id: uuid().defaultRandom().primaryKey(),
		createdAt: timestamp().defaultNow().notNull(),
		universeId: uuid()
			.references(() => universes.id, { onDelete: 'cascade' })
			.notNull(),
		slug: varchar({ length: 255 }).notNull(),
		title: varchar({ length: 255 }).notNull(),
		text: text().notNull(),
	},
	(table) => [
		index('article_universe_id_idx').on(table.universeId),
		unique('articles_universe_id_slug_unique').on(table.universeId, table.slug),
	],
);

export type Article = typeof articles.$inferSelect;
