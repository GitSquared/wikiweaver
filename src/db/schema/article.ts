import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { universe } from './universe';

export const article = pgTable('articles', {
	id: uuid().defaultRandom().primaryKey(),
	createdAt: timestamp().defaultNow().notNull(),
	universeId: uuid()
		.references(() => universe.id)
		.notNull(),
	slug: varchar({ length: 255 }).notNull().unique(),
	title: varchar({ length: 255 }).notNull(),
});
