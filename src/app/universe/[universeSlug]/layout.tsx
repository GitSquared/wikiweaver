import MultiverseWindow from '@/components/MultiverseWindow';
import { db } from '@/db';
import { universe } from '@/db/schema/universe';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import type { ReactNode } from 'react';

export default async function UniverseLayout({
	children,
	params,
}: {
	children: ReactNode;
	params: Promise<{ universeSlug: string }>;
}) {
	const { universeSlug } = await params;

	const [verse] = await db
		.select()
		.from(universe)
		.where(eq(universe.slug, universeSlug))
		.limit(1);

	return (
		<div>
			<header className="bg-background flex flex-row items-center px-8 py-3 gap-8">
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
				<div className="flex flex-row items-center gap-6">
					<hr className="bg-slate-700 h-8 w-[1px] rotate-16" />
					<Link href={`/universe/${universeSlug}`}>
						<h1 className="text-medium font-medium select-none">
							{verse.name} Wiki
						</h1>
					</Link>
				</div>
			</header>
			<main className="px-8 py-3">{children}</main>
		</div>
	);
}
