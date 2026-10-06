import type { ArticleChunk } from './articleStream';

interface ReadArticleStreamOptions {
	onChunk: (chunk: string) => void;
	onReset?: () => void;
	signal?: AbortSignal;
}

export async function readArticleStream(
	stream: ReadableStream<ArticleChunk>,
	{ onChunk, onReset, signal }: ReadArticleStreamOptions,
): Promise<void> {
	const reader = stream.getReader();
	let aborted = signal?.aborted ?? false;

	const abort = () => {
		aborted = true;
		void reader.cancel().catch(() => undefined);
	};

	signal?.addEventListener('abort', abort, { once: true });
	if (aborted) {
		abort();
	}

	try {
		while (!aborted) {
			const { done, value } = await reader.read();
			if (done || aborted) {
				return;
			}
			if (typeof value === 'object' && value.type === 'reset') {
				onReset?.();
			} else if (typeof value === 'string' && value) {
				onChunk(value);
			}
		}
	} catch (error) {
		if (!aborted) {
			throw error;
		}
	} finally {
		signal?.removeEventListener('abort', abort);
		reader.releaseLock();
	}
}
