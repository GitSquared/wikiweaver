import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

export const articles = pgTable('articles', {
	id: uuid().defaultRandom().primaryKey(),
	slug: varchar({ length: 255 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
});
