import { eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import MultiverseWindow from '@/components/MultiverseWindow';
import { db } from '@/db';
import { universes } from '@/db/schema/universe';
import HeaderSearch from './components/HeaderSearch';

export const metadata: Metadata = {
	generator: 'WikiWeaver AI',
	authors: [
		{
			name: 'WikiWeaver AI',
			url: 'https://wikiweaver.gaby.dev',
		},
	],
};

export default async function UniverseLayout({
	children,
	params,
}: {
	children: ReactNode;
	params: Promise<{ universeSlug: string }>;
}) {
	const { universeSlug } = await params;

	const [universe] = await db
		.select()
		.from(universes)
		.where(eq(universes.slug, universeSlug))
		.limit(1);

	return (
		<div className="flex flex-col min-h-screen max-w-[60rem] mx-auto">
			<header className="bg-background px-8 flex flex-col md:flex-row gap-2 items-center justify-between">
				<div className="flex flex-row items-center py-3 gap-4">
					<Link href="/">
						<div className="h-[50px] w-min grid grid-cols-[auto_auto] gap-x-3 gap-y-0.5">
							<div className="row-span-2">
								<MultiverseWindow size="size-[50px]" />
							</div>
							<span className="leading-none text-xl font-serif font-semibold self-end">
								WikiWeaver
							</span>
							<span className="leading-none text-sm font-serif font-medium whitespace-nowrap">
								Weave new worlds
							</span>
						</div>
					</Link>

					<hr className="bg-slate-700 h-8 w-[1px] rotate-16" />
					<Link href={`/universe/${universeSlug}`}>
						<h1 className="text-medium font-medium select-none">
							{universe.name} Wiki
						</h1>
					</Link>
				</div>
				<HeaderSearch universeId={universe.id} universeSlug={universe.slug} />
			</header>
			<main className="px-8 py-6 grow flex flex-col">{children}</main>
		</div>
	);
}
