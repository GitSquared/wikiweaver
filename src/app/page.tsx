import { db } from '@/db';
import { universes } from '@/db/schema/universe';
import { slugify } from '@/lib/slugify';
import { weaveUniverseName } from '@/lib/weave';
import Home from './components/Home';

export const DEFAULT_UNIVERSE_SLUG = 'datawood_realm';

async function makeUniverse(prompt: string): // returns slug
Promise<string> {
	'use server';

	if (!prompt || prompt.length < 10 || prompt.length > 300) {
		throw new Error(
			'Prompt must be at least 10 characters long and at most 300 characters long.',
		);
	}

	const universeName = await weaveUniverseName({ prompt });

	const slug = slugify(universeName);

	await db.insert(universes).values({
		name: universeName,
		slug,
		prompt,
	});

	return slug;
}

export default async function HomePage() {
	return (
		<Home
			onMakeUniverse={makeUniverse}
			defaultUniverseSlug={DEFAULT_UNIVERSE_SLUG}
		/>
	);
}
