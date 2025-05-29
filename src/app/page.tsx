import Home from './components/Home';

export const DEFAULT_UNIVERSE_SLUG = 'Treedataland';

export default async function HomePage() {
	async function makeUniverse(prompt: string): Promise<string> {
		// returns slug
		'use server';

		console.log('Creating universe with prompt:', prompt);

		// TODO: implement

		return DEFAULT_UNIVERSE_SLUG;
	}

	return (
		<Home
			onMakeUniverse={makeUniverse}
			defaultUniverseSlug={DEFAULT_UNIVERSE_SLUG}
		/>
	);
}
