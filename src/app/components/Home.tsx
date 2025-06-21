'use client';

import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import MultiverseWindow, {
	type MultiverseWindowRef,
} from '@/components/MultiverseWindow';
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
	const [error, setError] = useState<string | null>(null);

	const router = useRouter();

	const navigateToUniverse = async (universeSlug: string) => {
		await windowRef.current?.blowUp();
		router.push(`/universe/${universeSlug}`);
	};

	const onSubmit = async (prompt: string) => {
		setError(null);
		try {
			const slug = await onMakeUniverse(prompt);
			await navigateToUniverse(slug);
		} catch (err) {
			setError(
				(err as Error)?.message ||
					'An error occurred while creating the universe.',
			);
			return;
		}
	};

	const onSubmitEmpty = async () => {
		setError(null);
		await navigateToUniverse(defaultUniverseSlug);
	};

	return (
		<main className="flex flex-col items-center justify-center min-h-[80vh] max-w-full gap-12 p-4">
			<div className="flex flex-col items-center gap-1">
				<h1 className="text-5xl font-serif font-semibold">WikiWeaver</h1>
				<h2 className="text-2xl font-serif font-medium">Weave new worlds</h2>
			</div>

			<MultiverseWindow ref={windowRef} size="size-[250px]" />

			<div className="flex flex-col items-center max-w-full gap-6 text-center">
				<p>What if you had access to another universe's Wikipedia?</p>

				<UniversePrompt onSubmit={onSubmit} onSubmitEmpty={onSubmitEmpty} />

				{error ? (
					<motion.p
						className="text-red-400 text-sm text-center min-h-[1.1rem] max-w-[min(500px,100%)]"
						initial={{ opacity: 0 }}
						animate={{
							opacity: 1,
							// Shake on appear
							x: [0, -5, 5, -5, 5, 0],
							transition: { duration: 0.5 },
						}}
					>
						{error}
					</motion.p>
				) : (
					<motion.p
						className="text-xs text-center text-muted-foreground max-w-md"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1, transition: { delay: 0.5 } }}
					>
						Enter a prompt to create a new universe and explore its wiki, or
						click "explore" to view the default universe. Follow the links to
						navigate through articles and generate more as you go.
					</motion.p>
				)}
			</div>
		</main>
	);
}
