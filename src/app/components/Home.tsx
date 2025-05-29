'use client';

import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import MultiverseWindow, { type MultiverseWindowRef } from './MultiverseWindow';
import UniversePrompt from './UniversePrompt';

interface HomeProps {
	onMakeUniverse: (prompt: string) => Promise<string>;
	defaultUniverseSlug: string;
}

export default function Home({
	onMakeUniverse,
	defaultUniverseSlug,
}: HomeProps) {
	const windowRef = useRef<MultiverseWindowRef>(null);

	const router = useRouter();

	const navigateToUniverse = async (universeSlug: string) => {
		await windowRef.current?.blowUp();
		router.push(`/universe/${universeSlug}`);
	};

	const onSubmit = async (prompt: string) => {
		const slug = await onMakeUniverse(prompt);
		await navigateToUniverse(slug);
	};

	const onSubmitEmpty = async () => {
		await navigateToUniverse(defaultUniverseSlug);
	};

	return (
		<main className="flex flex-col items-center justify-center min-h-screen gap-12">
			<div className="flex flex-col items-center gap-1">
				<h1 className="text-5xl font-serif font-semibold">WikiWeaver</h1>
				<h2 className="text-2xl font-serif font-medium">Weave new worlds</h2>
			</div>

			<MultiverseWindow ref={windowRef} />

			<div className="flex flex-col items-center gap-4">
				<p>What if you had access to another universe's Wikipedia?</p>

				<UniversePrompt onSubmit={onSubmit} onSubmitEmpty={onSubmitEmpty} />
			</div>
		</main>
	);
}
