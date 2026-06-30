interface ReadArticleStreamOptions {
	onChunk: (chunk: string) => void;
	signal?: AbortSignal;
}

export async function readArticleStream(
	stream: ReadableStream<string>,
	{ onChunk, signal }: ReadArticleStreamOptions,
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
			if (value) {
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
