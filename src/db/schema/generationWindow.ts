import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const generationWindows = pgTable(
	'generationWindows',
	{
		key: text().primaryKey(),
		count: integer().notNull().default(1),
		expiresAt: timestamp({ withTimezone: true }).notNull(),
		category: text().notNull(),
		userAgent: text().notNull(),
		country: text().notNull(),
	},
	(table) => [index('generation_window_expiry_idx').on(table.expiresAt)],
);
