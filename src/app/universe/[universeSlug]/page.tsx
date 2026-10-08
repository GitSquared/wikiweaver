import { asc, eq, sql } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/db';
import { articles } from '@/db/schema/article';
import { universes } from '@/db/schema/universe';
import { admitGeneration } from '@/lib/generationGuard';
import { slugify } from '@/lib/slugify';
import { weaveFirstArticleTitle } from '@/lib/weave';

async function findArticleSlug(
	universeSlug: string,
): Promise<string | { message: string }> {
	'use server';

	const [universe] = await db
		.select()
		.from(universes)
		.where(eq(universes.slug, universeSlug))
		.limit(1);

	if (!universe) {
		notFound();
	}

	const [firstArticle] = await db
		.select()
		.from(articles)
		.where(
			sql`${eq(articles.universeId, universe.id)} AND length(trim(${articles.text})) > 0`,
		)
		.orderBy(asc(articles.createdAt))
		.limit(1);

	if (firstArticle) {
		return firstArticle.slug;
	}

	const admission = await admitGeneration(`first-title:${universeSlug}`);
	if (!admission.allowed) return { message: admission.message };

	// No articles found, make the first one!
	const title = await weaveFirstArticleTitle({
		universe,
	});

	const slug = slugify(title);

	return slug;
}

export default async function UniversePage({
	params,
}: {
	params: Promise<{ universeSlug: string }>;
}) {
	const { universeSlug } = await params;

	const articleSlug = await findArticleSlug(universeSlug);

	if (typeof articleSlug !== 'string') {
		return (
			<article role="status">
				<p>{articleSlug.message}</p>
				<a href={`/universe/${universeSlug}`}>Try again</a>
			</article>
		);
	}

	redirect(`/universe/${universeSlug}/wiki/${articleSlug}`);
}
