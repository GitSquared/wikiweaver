import { and, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { articles } from '@/db/schema/article';
import { universes } from '@/db/schema/universe';
import { persistCompletedArticle } from '@/lib/persistArticle';
import { unslugify } from '@/lib/slugify';
import { weaveWikiArticle } from '@/lib/weave';
import ArticleRenderer from './components/ArticleRenderer';

async function findOrCreateArticle({
	universeSlug,
	articleSlug,
}: {
	universeSlug: string;
	articleSlug: string;
}) {
	const [existingArticle] = await db
		.select()
		.from(articles)
		.leftJoin(universes, eq(articles.universeId, universes.id))
		.where(
			and(eq(universes.slug, universeSlug), eq(articles.slug, articleSlug)),
		);

	if (existingArticle) {
		return existingArticle.articles.text;
	}

	const title = unslugify(articleSlug);

	console.log(`Starting to weave new article: ${universeSlug} / ${title}`);

	const [universe] = await db
		.select()
		.from(universes)
		.where(eq(universes.slug, universeSlug))
		.limit(1);

	if (!universe) {
		notFound();
	}

	const weavedArticle = await weaveWikiArticle({
		universe,
		title,
		onFinish: async ({ text, finishReason }) => {
			try {
				await persistCompletedArticle({
					universeId: universe.id,
					articleSlug,
					title,
					text,
					finishReason,
				});
				console.log(`Weaved new article: ${universe.name} / ${title}`);
			} catch (error) {
				console.error(
					`Failed to persist article: ${universe.name} / ${title}`,
					error,
				);
				throw error;
			}
		},
		onError: ({ error }) => {
			console.error(
				`Article generation failed: ${universe.name} / ${title}`,
				error,
			);
		},
	});

	return weavedArticle.textStream;
}

export default async function WikiArticlePage({
	params,
}: {
	params: Promise<{ universeSlug: string; articleSlug: string }>;
}) {
	const { universeSlug, articleSlug } = await params;

	// Returns a ReadableStream
	const article = findOrCreateArticle({
		universeSlug,
		articleSlug,
	});

	return <ArticleRenderer articleTextStream={article} />;
}
