'use server';
import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { type Article, articles } from '@/db/schema/article';
import { type Paragraph, paragraphs } from '@/db/schema/paragraph';

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
			.map((p) => p.replaceAll(/[[\]]/g, ''))
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

const SEARCH_LIMIT = 15;

function paragraphSelection(score: ReturnType<typeof sql<number>>) {
	return {
		articleId: articles.id,
		articleTitle: articles.title,
		articleSlug: articles.slug,
		id: paragraphs.id,
		text: paragraphs.text,
		score,
	};
}

async function searchArticlesWithPgSearch(universeId: string, query: string) {
	const score = sql<number>`paradedb.score(${paragraphs.id})`;

	return db
		.select(paragraphSelection(score))
		.from(paragraphs)
		.innerJoin(articles, eq(paragraphs.articleId, articles.id))
		.where(
			and(
				eq(articles.universeId, universeId),
				sql`${paragraphs.id} @@@ paradedb.match(${paragraphs.text.name}, ${query}, distance => 1)`,
			),
		)
		.orderBy(desc(score))
		.limit(SEARCH_LIMIT);
}

async function searchArticlesWithLakebaseText(
	universeId: string,
	query: string,
) {
	const textQuery = sql`websearch_to_tsquery('english', ${query})`;
	const score = sql<number>`${paragraphs.searchTsv} <@> to_bm25query(
		to_tsvector('english', ${query}),
		'paragraph_search_lakebase_idx'::regclass
	)`;
	const matches = await db
		.select(paragraphSelection(score))
		.from(paragraphs)
		.innerJoin(articles, eq(paragraphs.articleId, articles.id))
		.where(
			and(
				eq(articles.universeId, universeId),
				sql`${paragraphs.searchTsv} @@ ${textQuery}`,
			),
		)
		.orderBy(asc(score))
		.limit(SEARCH_LIMIT);

	if (matches.length > 0) {
		return matches;
	}

	// pg_search supported typo distance directly. lakebase_text intentionally
	// sticks to Postgres FTS, so pg_trgm provides a fuzzy fallback when the BM25
	// query has no exact/stemmed matches.
	const fuzzyScore = sql<number>`word_similarity(${query}, ${paragraphs.text})`;
	return db
		.select(paragraphSelection(fuzzyScore))
		.from(paragraphs)
		.innerJoin(articles, eq(paragraphs.articleId, articles.id))
		.where(
			and(
				eq(articles.universeId, universeId),
				sql`${query} <% ${paragraphs.text}`,
			),
		)
		.orderBy(desc(fuzzyScore))
		.limit(SEARCH_LIMIT);
}

export async function searchArticles(
	universeId: string,
	query: string,
): Promise<SearchArticlesResult[]> {
	const normalizedQuery = query.trim();
	if (!normalizedQuery) {
		return [];
	}

	const topParagraphs =
		process.env.WIKIWEAVER_SEARCH_BACKEND === 'lakebase_text'
			? await searchArticlesWithLakebaseText(universeId, normalizedQuery)
			: await searchArticlesWithPgSearch(universeId, normalizedQuery);

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
