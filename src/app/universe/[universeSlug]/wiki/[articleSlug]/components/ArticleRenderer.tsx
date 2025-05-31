import { slugify } from '@/lib/slugify';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import styles from './ArticleRenderer.module.css';

interface ArticleRendererProps {
	children: string;
}

export default function ArticleRenderer({ children }: ArticleRendererProps) {
	return (
		<article className={styles.article}>
			<ReactMarkdown
				components={{
					a: ({ node, ...props }) => {
						const href = props.href || '';
						if (href.startsWith('http')) {
							return <a {...props} />;
						}
						return <Link href={href} {...props} />;
					},
				}}
			>
				{makeArticleReferencesMarkdownLinks(children)}
			</ReactMarkdown>
		</article>
	);
}

function makeArticleReferencesMarkdownLinks(markdown: string): string {
	return markdown.replace(/\[\[(.*?)\]\]/g, (_, p1) => {
		const articleTitle = p1.trim();
		const articleLink = slugify(articleTitle);

		return `[${articleTitle}](${articleLink})`;
	});
}
