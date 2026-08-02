import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { articles } from '@/db/schema/article';

interface ArticleCandidate {
	id: string;
	text: string;
}

export async function removeEmptyArticlePlaceholder({
	id,
	text,
}: ArticleCandidate): Promise<boolean> {
	if (text.trim()) {
		return false;
	}

	const [deletedArticle] = await db
		.delete(articles)
		.where(and(eq(articles.id, id), eq(articles.text, text)))
		.returning({ id: articles.id });

	return Boolean(deletedArticle);
}
