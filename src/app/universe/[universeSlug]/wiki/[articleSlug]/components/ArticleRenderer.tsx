'use client';

import { slugify } from '@/lib/slugify';
import { motion, useAnimate } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useLayoutEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './ArticleRenderer.module.css';

interface ArticleRendererProps {
	articleTextStream: Promise<string | ReadableStream<string>>;
}

export default function ArticleRenderer({
	articleTextStream,
}: ArticleRendererProps) {
	const router = useRouter();

	const articleStream = use(articleTextStream);
	const [receivedArticleText, setReceivedArticleText] = useState<string>('');

	useEffect(() => {
		setReceivedArticleText('');
		if (typeof articleStream === 'string') {
			setReceivedArticleText(articleStream);
			return;
		}

		if (articleStream.locked) return;

		let cancelled = false;
		const reader = articleStream.getReader();

		function processChunk({ done, value }: ReadableStreamReadResult<string>) {
			if (cancelled) {
				return;
			}

			if (value) {
				setReceivedArticleText((prev) => prev + value);
			}

			if (done) {
				// Refresh in the background to ensure we show the article generation that
				// was committed to the database
				router.refresh();
				return;
			}

			reader.read().then(processChunk);
		}

		reader.read().then(processChunk);

		return () => {
			cancelled = true;
			reader.cancel();
		};
	}, [articleStream, router]);

	const [scope, animate] = useAnimate();

	useLayoutEffect(() => {
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
				{makeArticleReferencesMarkdownLinks(receivedArticleText)}
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
