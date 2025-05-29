import { db } from '@/db';
import { universe } from '@/db/schema/universe';
import { slugify } from '@/lib/slugify';
import { weaveUniverseName } from '@/lib/weave';
import Home from './components/Home';

export const DEFAULT_UNIVERSE_SLUG = 'telepathica';

async function makeUniverse(prompt: string): // returns slug
Promise<string> {
	'use server';

	const universeName = await weaveUniverseName({ prompt });

	const slug = slugify(universeName);

	await db.insert(universe).values({
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
