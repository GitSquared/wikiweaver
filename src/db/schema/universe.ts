import { pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core';

export const universe = pgTable('universe', {
	id: uuid().defaultRandom().primaryKey(),
	slug: varchar({ length: 255 }).notNull(),
	prompt: text().notNull(),
});
