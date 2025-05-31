import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { universes } from './universe';

export const articles = pgTable('articles', {
	id: uuid().defaultRandom().primaryKey(),
	createdAt: timestamp().defaultNow().notNull(),
	universeId: uuid()
		.references(() => universes.id)
		.notNull(),
	slug: varchar({ length: 255 }).notNull().unique(),
	title: varchar({ length: 255 }).notNull(),
	content: text().notNull(),
});
