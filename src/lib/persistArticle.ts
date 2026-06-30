import type { FinishReason } from 'ai';
import { db } from '@/db';
import { articles } from '@/db/schema/article';
import { indexArticle } from './search';

interface PersistCompletedArticleOptions {
	universeId: string;
	articleSlug: string;
	title: string;
	text: string;
	finishReason: FinishReason;
}

export async function persistCompletedArticle({
	universeId,
	articleSlug,
	title,
	text,
	finishReason,
}: PersistCompletedArticleOptions): Promise<void> {
	if (finishReason !== 'stop') {
		throw new Error(`Incomplete article generation: ${finishReason}`);
	}

	if (!text.trim()) {
		throw new Error('Article generation returned no text');
	}

	const [article] = await db
		.insert(articles)
		.values({
			universeId,
			slug: articleSlug,
			title,
			text,
		})
		.onConflictDoNothing()
		.returning();

	if (article) {
		await indexArticle(article);
	}
}
