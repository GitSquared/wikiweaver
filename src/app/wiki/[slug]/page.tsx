import ArticleRenderer from '@/lib/components/ArticleRenderer';
import { unslugify } from '@/lib/slugify';
import { weaveWikiArticle } from '@/lib/weave';

export default async function WikiArticlePage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;

	const title = unslugify(slug);

	const article = await weaveWikiArticle({ title });

	return <ArticleRenderer>{article}</ArticleRenderer>;
}
