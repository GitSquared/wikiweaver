import { db } from '@/db';
import { article } from '@/db/schema/article';
import { universe } from '@/db/schema/universe';
import { slugify } from '@/lib/slugify';
import { weaveFirstArticleTitle } from '@/lib/weave';
import { eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';

async function findArticleSlug(universeSlug: string): Promise<string> {
	'use server';

	const [verse] = await db
		.select()
		.from(universe)
		.where(eq(universe.slug, universeSlug))
		.limit(1);

	if (!verse) {
		notFound();
	}

	const [firstArticle] = await db
		.select()
		.from(article)
		.where(eq(article.universeId, verse.id))
		.limit(1);

	if (firstArticle) {
		return firstArticle.slug;
	}

	// No articles found, make the first one!
	const title = await weaveFirstArticleTitle({
		verse,
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
