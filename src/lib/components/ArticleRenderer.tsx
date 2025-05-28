import ReactMarkdown from 'react-markdown';
import { slugify } from '../slugify';
import styles from './ArticleRenderer.module.css';

interface ArticleRendererProps {
	children: string;
}

export default function ArticleRenderer({ children }: ArticleRendererProps) {
	return (
		<article className={styles.article}>
			<ReactMarkdown>
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
