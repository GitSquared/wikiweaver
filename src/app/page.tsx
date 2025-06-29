import { db } from '@/db';
import { universes } from '@/db/schema/universe';
import { slugify } from '@/lib/slugify';
import { weaveUniverseName } from '@/lib/weave';
import Home from './components/Home';
import TopUniverses from './components/TopUniverses';

const DEFAULT_UNIVERSE_SLUG = 'datawood-realm';

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

export const revalidate = 300; // revalidate every 5 minutes to keep the top universes ranking fresh

export default async function HomePage() {
	return (
		<div className="flex flex-col items-center lg:flex-row lg:justify-center gap-8">
			<Home
				onMakeUniverse={makeUniverse}
				defaultUniverseSlug={DEFAULT_UNIVERSE_SLUG}
			/>
			<hr className="border border-foreground/10 w-lg lg:w-0 lg:h-[40vh]" />
			<TopUniverses />
		</div>
	);
}
