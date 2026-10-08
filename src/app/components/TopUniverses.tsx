import { count, eq, sql } from 'drizzle-orm';
import { ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/db';
import { articles } from '@/db/schema/article';
import { universes } from '@/db/schema/universe';
import { selectFeaturedUniverses } from '@/lib/featuredUniverses';

export default async function TopUniverses() {
	const candidates = await db
		.select({
			universes,
			articleCount: count(articles.id),
		})
		.from(universes)
		.leftJoin(
			articles,
			sql`${eq(articles.universeId, universes.id)} AND length(trim(${articles.text})) > 0`,
		)
		.groupBy(universes.id);

	const topUniverses = selectFeaturedUniverses(
		candidates.map((candidate) => ({
			...candidate,
			id: candidate.universes.id,
		})),
	);

	return (
		<aside className="max-w-lg fade-in delay-1000">
			<h2 className="text-xl font-semibold px-4">Explore Universes</h2>
			<ol className="flex flex-col mt-4">
				{topUniverses.map(({ universes: universe, articleCount }) => (
					<Link
						key={universe.id}
						href={`/universe/${universe.slug}`}
						className="no-underline"
						prefetch={false}
					>
						<li className="grid grid-cols-[1fr_auto] items-center gap-2 p-4 rounded-md cursor-pointer hover:bg-accent group">
							<h3 className="text-sm font-medium">
								{universe.name}{' '}
								<span className="font-normal text-muted-foreground">
									— {articleCount} articles
								</span>
							</h3>
							<ChevronRightIcon className="row-span-2 text-muted-foreground group-hover:text-universe-blue" />
							<p className="text-sm italic">{universe.prompt}</p>
						</li>
					</Link>
				))}
			</ol>
		</aside>
	);
}
