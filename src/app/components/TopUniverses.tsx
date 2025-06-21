import { count, desc, eq } from 'drizzle-orm';
import { ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/db';
import { articles } from '@/db/schema/article';
import { universes } from '@/db/schema/universe';

export default async function TopUniverses() {
	const topUniverses = await db
		.select({
			universes,
			articleCount: count(articles.id),
		})
		.from(universes)
		.leftJoin(articles, eq(articles.universeId, universes.id))
		.groupBy(universes.id)
		.orderBy(desc(count(articles.id)))
		.limit(5);

	return (
		<aside className="max-w-2xl">
			<h2 className="text-2xl font-semibold px-4">Top Universes</h2>
			<ol className="flex flex-col mt-4">
				{topUniverses.map(({ universes: universe, articleCount }) => (
					<Link
						key={universe.id}
						href={`/universe/${universe.slug}`}
						className="no-underline"
						prefetch={false}
					>
						<li className="grid grid-cols-[1fr_auto] items-center gap-2 p-4 rounded-md cursor-pointer hover:bg-accent group">
							<h3 className="font-medium">
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
