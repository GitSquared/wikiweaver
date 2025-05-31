import { db } from '@/db';
import { articles } from '@/db/schema/article';
import { universes } from '@/db/schema/universe';
import { slugify } from '@/lib/slugify';
import { weaveFirstArticleTitle } from '@/lib/weave';
import { eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';

async function findArticleSlug(universeSlug: string): Promise<string> {
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
		.where(eq(articles.universeId, universe.id))
		.limit(1);

	if (firstArticle) {
		return firstArticle.slug;
	}

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

	redirect(`/universe/${universeSlug}/wiki/${articleSlug}`);
}
