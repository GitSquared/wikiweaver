import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const universe = pgTable('universe', {
	id: uuid().defaultRandom().primaryKey(),
	createdAt: timestamp().defaultNow().notNull(),
	slug: varchar({ length: 255 }).notNull().unique(),
	name: varchar({ length: 255 }).notNull(),
	prompt: text().notNull(),
});
