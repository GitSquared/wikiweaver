'use client';

import { slugify } from '@/lib/slugify';
import { motion, useAnimate } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './ArticleRenderer.module.css';

interface ArticleRendererProps {
	children: string;
}

export default function ArticleRenderer({ children }: ArticleRendererProps) {
	const router = useRouter();
	const [scope, animate] = useAnimate();

	useEffect(() => {
		if (scope.current) {
			animate(scope.current, {
				opacity: 1,
				y: 0,
			});
		}
	}, [scope, animate]);

	return (
		<motion.article
			ref={scope}
			className={styles.article}
			initial={{ opacity: 0, y: 15 }}
			animate={{ opacity: 1, y: 0 }}
		>
			<ReactMarkdown
				components={{
					a: ({ node, ...props }) => {
						const href = props.href || '';
						if (href.startsWith('http')) {
							return <a {...props} />;
						}
						return (
							<Link
								href={href}
								onClick={async (e) => {
									e.preventDefault();

									await animate(
										scope.current,
										{
											opacity: 0,
										},
										{
											duration: 0.15,
										},
									);
									router.push(href);
								}}
								{...props}
							/>
						);
					},
				}}
			>
				{makeArticleReferencesMarkdownLinks(children)}
			</ReactMarkdown>
		</motion.article>
	);
}

function makeArticleReferencesMarkdownLinks(markdown: string): string {
	return markdown.replace(/\[\[(.*?)\]\]/g, (_, p1) => {
		const articleTitle = p1.trim();
		const articleLink = slugify(articleTitle);

		return `[${articleTitle}](${articleLink})`;
	});
}
