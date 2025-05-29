import dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

dotenv.config({ path: './.env.local' });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
	throw new Error('DATABASE_URL environment variable is not set');
}

export default defineConfig({
	out: './drizzle',
	schema: './src/db/schema',
	dialect: 'postgresql',
	dbCredentials: {
		url: dbUrl,
	},
	// 2025-05-29 snake_case seems to cause some issues like untranformed default column names on insert
	casing: 'camelCase',
});
