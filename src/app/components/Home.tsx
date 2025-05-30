'use client';

import MultiverseWindow, {
	type MultiverseWindowRef,
} from '@/components/MultiverseWindow';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
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
		<main className="flex flex-col items-center justify-center min-h-screen gap-12">
			<div className="flex flex-col items-center gap-1">
				<h1 className="text-5xl font-serif font-semibold">WikiWeaver</h1>
				<h2 className="text-2xl font-serif font-medium">Weave new worlds</h2>
			</div>

			<MultiverseWindow ref={windowRef} size="size-[250px]" />

			<div className="flex flex-col items-center gap-4">
				<p>What if you had access to another universe's Wikipedia?</p>

				<UniversePrompt onSubmit={onSubmit} onSubmitEmpty={onSubmitEmpty} />

				<motion.p
					className="text-red-400 text-sm text-center min-h-[1.1rem] max-w-[min(500px,100%)]"
					initial={{ opacity: 0 }}
					animate={
						error
							? {
									opacity: 1,
									// Shake on appear
									x: [0, -5, 5, -5, 5, 0],
									transition: { duration: 0.5 },
								}
							: { opacity: 0 }
					}
				>
					{error}
				</motion.p>
			</div>
		</main>
	);
}
