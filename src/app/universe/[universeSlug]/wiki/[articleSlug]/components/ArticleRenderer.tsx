'use client';

import { motion, useAnimate } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useLayoutEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { readArticleStream } from '@/lib/readArticleStream';
import { slugify } from '@/lib/slugify';
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
	const [streamError, setStreamError] = useState<string | null>(null);

	useEffect(() => {
		setReceivedArticleText('');
		setStreamError(null);
		if (typeof articleStream === 'string') {
			setReceivedArticleText(articleStream);
			return;
		}

		const abortController = new AbortController();

		void readArticleStream(articleStream, {
			signal: abortController.signal,
			onChunk: (chunk) => {
				setReceivedArticleText((previous) => previous + chunk);
			},
		})
			.then(() => {
				if (!abortController.signal.aborted) {
					// AI SDK awaits article persistence before closing the stream.
					router.refresh();
				}
			})
			.catch((error: unknown) => {
				if (!abortController.signal.aborted) {
					console.error('Article stream failed', error);
					setStreamError('This article could not be fully generated.');
				}
			});

		return () => abortController.abort();
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
			{streamError ? (
				<div role="alert" className="flex flex-col items-start gap-3">
					<p>{streamError}</p>
					<button
						type="button"
						className="underline underline-offset-4"
						onClick={() => router.refresh()}
					>
						Try again
					</button>
				</div>
			) : receivedArticleText ? (
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
			) : (
				<p role="status" className="text-muted-foreground">
					Weaving article…
				</p>
			)}
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
