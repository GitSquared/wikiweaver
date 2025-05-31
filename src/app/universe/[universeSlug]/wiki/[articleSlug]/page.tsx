import { db } from '@/db';
import { universe } from '@/db/schema/universe';
import { unslugify } from '@/lib/slugify';
import { weaveWikiArticle } from '@/lib/weave';
import { eq } from 'drizzle-orm';
import ArticleRenderer from './components/ArticleRenderer';

export default async function WikiArticlePage({
	params,
}: {
	params: Promise<{ universeSlug: string; articleSlug: string }>;
}) {
	const { universeSlug, articleSlug } = await params;

	const title = unslugify(articleSlug);

	const [verse] = await db
		.select()
		.from(universe)
		.where(eq(universe.slug, universeSlug))
		.limit(1);

	const article = await weaveWikiArticle({ verse, title });

	return <ArticleRenderer>{article}</ArticleRenderer>;
}
