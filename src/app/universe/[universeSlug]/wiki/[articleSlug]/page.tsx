import ArticleRenderer from '@/components/ArticleRenderer';
import { unslugify } from '@/lib/slugify';
import { weaveWikiArticle } from '@/lib/weave';

export default async function WikiArticlePage({
	params,
}: {
	params: Promise<{ universeSlug: string; articleSlug: string }>;
}) {
	const { universeSlug, articleSlug } = await params;

	const title = unslugify(articleSlug);

	const article = await weaveWikiArticle({ title });

	return <ArticleRenderer>{article}</ArticleRenderer>;
}
