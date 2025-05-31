import { db } from '@/db';
import { articles } from '@/db/schema/article';
import { universes } from '@/db/schema/universe';
import { unslugify } from '@/lib/slugify';
import { weaveWikiArticle } from '@/lib/weave';
import { and, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import ArticleRenderer from './components/ArticleRenderer';

async function findOrCreateArticle({
	universeSlug,
	articleSlug,
}: {
	universeSlug: string;
	articleSlug: string;
}): Promise<string> {
	const [existingArticle] = await db
		.select()
		.from(articles)
		.leftJoin(universes, eq(articles.universeId, universes.id))
		.where(
			and(eq(universes.slug, universeSlug), eq(articles.slug, articleSlug)),
		);

	if (existingArticle) {
		return existingArticle.articles.content;
	}

	const title = unslugify(articleSlug);

	const [universe] = await db
		.select()
		.from(universes)
		.where(eq(universes.slug, universeSlug))
		.limit(1);

	if (!universe) {
		notFound();
	}

	const newArticleContent = await weaveWikiArticle({ universe, title });

	await db
		.insert(articles)
		.values({
			universeId: universe.id,
			slug: articleSlug,
			title,
			content: newArticleContent,
		})
		.onConflictDoNothing(); // If two generations happen simultaneously, keep the first one

	// Get the generated article back, or the first one that was generated in case of conflicts
	const [newArticle] = await db
		.select()
		.from(articles)
		.where(eq(articles.slug, articleSlug))
		.limit(1);

	if (newArticle.content === newArticleContent) {
		// Our generation was the one inserted!
		console.log(`Weaved new article: ${universe.name} / ${title}`);
	}

	return newArticle.content;
}

export default async function WikiArticlePage({
	params,
}: {
	params: Promise<{ universeSlug: string; articleSlug: string }>;
}) {
	const { universeSlug, articleSlug } = await params;

	const article = await findOrCreateArticle({
		universeSlug,
		articleSlug,
	});

	return <ArticleRenderer>{article}</ArticleRenderer>;
}
