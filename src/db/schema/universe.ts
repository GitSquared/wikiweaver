import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const universes = pgTable('universes', {
	id: uuid().defaultRandom().primaryKey(),
	createdAt: timestamp().defaultNow().notNull(),
	slug: varchar({ length: 255 }).notNull().unique(),
	name: varchar({ length: 255 }).notNull(),
	prompt: text().notNull(),
});

export type Universe = typeof universes.$inferSelect;
