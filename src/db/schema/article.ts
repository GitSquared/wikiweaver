import {
	index,
	pgTable,
	text,
	timestamp,
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
		slug: varchar({ length: 255 }).notNull().unique(),
		title: varchar({ length: 255 }).notNull(),
		text: text().notNull(),
	},
	(table) => [index('article_universe_id_idx').on(table.universeId)],
);

export type Article = typeof articles.$inferSelect;
