import { db } from '@/db';
import { universes } from '@/db/schema/universe';
import { slugify } from '@/lib/slugify';
import { weaveUniverseName } from '@/lib/weave';
import Home from './components/Home';
import TopUniverses from './components/TopUniverses';

const DEFAULT_UNIVERSE_SLUG = 'datawood-realm';

type MakeUniverseResult =
	| { ok: true; slug: string }
	| { ok: false; error: string };

async function makeUniverse(prompt: string): // returns slug
Promise<MakeUniverseResult> {
	'use server';

	if (!prompt || prompt.length < 10 || prompt.length > 300) {
		return {
			ok: false,
			error:
				'Prompt must be at least 10 characters long and at most 300 characters long.',
		};
	}

	try {
		const universeName = await weaveUniverseName({ prompt });

		const slug = slugify(universeName);

		await db.insert(universes).values({
			name: universeName,
			slug,
			prompt,
		});

		return { ok: true, slug };
	} catch (error) {
		if (
			error instanceof Error &&
			error.message.startsWith('Harmful prompt detected:')
		) {
			return {
				ok: false,
				error: 'This prompt was rejected by the content safety check.',
			};
		}

		console.error('Failed to create universe', error);

		return {
			ok: false,
			error: 'An error occurred while creating the universe.',
		};
	}
}

export const revalidate = 300; // revalidate every 5 minutes to keep the top universes ranking fresh

export default async function HomePage() {
	return (
		<div className="flex flex-col items-center lg:flex-row lg:justify-center gap-8 lg:gap-12">
			<Home
				onMakeUniverse={makeUniverse}
				defaultUniverseSlug={DEFAULT_UNIVERSE_SLUG}
			/>
			<hr className="border border-foreground/10 w-lg lg:w-0 lg:h-[40vh]" />
			<TopUniverses />
		</div>
	);
}
