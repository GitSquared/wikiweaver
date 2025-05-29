import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { universe } from './universe';

export const article = pgTable('articles', {
	id: uuid().defaultRandom().primaryKey(),
	universeId: uuid()
		.references(() => universe.id)
		.notNull(),
	slug: varchar({ length: 255 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
});
