'use server';
import { db } from '@/db';
import { type Article, articles } from '@/db/schema/article';
import { type Paragraph, paragraphs } from '@/db/schema/paragraph';
import { and, desc, eq, sql } from 'drizzle-orm';

function cutParagraphsForIndexing(articleText: string): string[] {
	return (
		articleText
			// split by paragraphs
			.split('\n\n')
			// trim whitespace
			.map((p) => p.trim())
			// remove markdown links...
			.map((p) => p.replaceAll(/]\(.+\)/g, ''))
			// ...bullet points
			.map((p) => p.replaceAll(/ *- /g, ''))
			// ...article links
			.map((p) => p.replaceAll(/[\[\]]/g, ''))
			// ...markdown text formatting
			.map((p) => p.replaceAll(/[_#*~]/g, ''))
			// ...and trim whitespace again
			.map((p) => p.trim())
			// keep only meaningful content, not just titles or few words
			.filter((p) => p.length > 70)
	);
}

export const TEST_cutParagraphsForIndexing = cutParagraphsForIndexing;

export async function indexArticle(article: Article): Promise<void> {
	await db.insert(paragraphs).values(
		cutParagraphsForIndexing(article.text).map((p) => ({
			articleId: article.id,
			text: p,
		})),
	);
}

export interface SearchArticlesResult {
	article: Pick<Article, 'id' | 'title' | 'slug'>;
	paragraphs: Pick<Paragraph, 'id' | 'text'>[];
}

export async function searchArticles(
	universeId: string,
	query: string,
): Promise<SearchArticlesResult[]> {
	const topParagraphs = await db
		.select({
			articleId: articles.id,
			articleTitle: articles.title,
			articleSlug: articles.slug,
			id: paragraphs.id,
			text: paragraphs.text,
			score: sql`paradedb.score(${paragraphs.id})`,
		})
		.from(paragraphs)
		.innerJoin(articles, eq(paragraphs.articleId, articles.id))
		.where(
			and(
				eq(articles.universeId, universeId),
				sql`${paragraphs.id} @@@ paradedb.match(${paragraphs.text.name}, ${query.trim()}, distance => 1)`,
			),
		)
		.orderBy(desc(sql`paradedb.score(${paragraphs.id})`))
		.limit(15);

	const grouped = new Map<
		string,
		{
			article: Pick<Article, 'id' | 'title' | 'slug'>;
			paragraphs: Pick<Paragraph, 'id' | 'text'>[];
		}
	>();

	for (const row of topParagraphs) {
		if (!grouped.has(row.articleId)) {
			grouped.set(row.articleId, {
				article: {
					id: row.articleId,
					title: row.articleTitle,
					slug: row.articleSlug,
				},
				paragraphs: [],
			});
		}
		grouped.get(row.articleId)?.paragraphs.push({ id: row.id, text: row.text });
	}

	const results = Array.from(grouped.values());
	return results;
}
