import { randomUUID } from 'node:crypto';
import { db } from '@/db';
import { universes } from '@/db/schema/universe';
import { slugify } from './slugify';

const MAX_SLUG_LENGTH = 255;
const MAX_INSERT_ATTEMPTS = 4;

interface PersistUniverseOptions {
	name: string;
	prompt: string;
}

function makeSuffixedSlug(baseSlug: string): string {
	const suffix = randomUUID().replaceAll('-', '').slice(0, 12);
	const prefix = baseSlug || 'universe';
	const availablePrefixLength = MAX_SLUG_LENGTH - suffix.length - 1;
	const truncatedPrefix = Array.from(prefix)
		.slice(0, availablePrefixLength)
		.join('')
		.replace(/-+$/g, '');

	return `${truncatedPrefix}-${suffix}`;
}

export async function persistUniverse({
	name,
	prompt,
}: PersistUniverseOptions): Promise<string> {
	const baseSlug = slugify(name);

	for (let attempt = 0; attempt < MAX_INSERT_ATTEMPTS; attempt += 1) {
		const slug =
			attempt === 0 && baseSlug ? baseSlug : makeSuffixedSlug(baseSlug);
		const [createdUniverse] = await db
			.insert(universes)
			.values({ name, slug, prompt })
			.onConflictDoNothing({ target: universes.slug })
			.returning({ slug: universes.slug });

		if (createdUniverse) return createdUniverse.slug;
	}

	throw new Error('Unable to allocate a unique universe slug');
}
