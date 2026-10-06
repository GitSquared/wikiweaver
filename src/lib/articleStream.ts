import { streamText } from 'ai';

export type ArticleChunk = string | { type: 'reset' };
type Options = Parameters<typeof streamText>[0];
type EndEvent = Parameters<NonNullable<Options['onEnd']>>[0];

// Two attempts fit within Hobby's 300s limit, leaving time for retrieval/persistence.
const ATTEMPT_TIMEOUT_MS = 140_000;
const MAX_ATTEMPTS = 2;

export function createArticleStream({
	model,
	prompt,
	onEnd,
	onError,
	article,
	deadlineAt = Date.now() + MAX_ATTEMPTS * ATTEMPT_TIMEOUT_MS,
}: Pick<Options, 'model' | 'onEnd' | 'onError'> & {
	prompt: string;
	article?: { universeId: string; title: string };
	deadlineAt?: number;
}): ReadableStream<ArticleChunk> {
	const cancellation = new AbortController();
	const requestId = crypto.randomUUID();
	const context = {
		requestId,
		article,
		model: typeof model === 'string' ? model : model.modelId,
	};
	return new ReadableStream<ArticleChunk>({
		async start(controller) {
			for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
				let completion: EndEvent | undefined;
				let gateway: unknown;
				const attemptCancellation = new AbortController();
				const signal = AbortSignal.any([
					cancellation.signal,
					attemptCancellation.signal,
				]);
				const deadline = setTimeout(
					() =>
						attemptCancellation.abort(
							new Error('Article generation time budget exhausted'),
						),
					Math.max(1, Math.min(ATTEMPT_TIMEOUT_MS, deadlineAt - Date.now())),
				);
				const startedAt = Date.now();
				console.log(
					JSON.stringify({
						event: 'article_generation_started',
						...context,
						attempt,
					}),
				);
				try {
					if (Date.now() >= deadlineAt)
						throw Object.assign(
							new Error('Article generation time budget exhausted'),
							{ retryable: false },
						);
					const result = streamText({
						model,
						prompt,
						maxRetries: 0,
						abortSignal: signal,
						onEnd: (event) => {
							completion = event;
						},
						onError: () => {}, // Report only after the retry budget is exhausted.
					});
					const reader = result.fullStream.getReader();
					let receivedContent = false;
					try {
						while (true) {
							const idle = setTimeout(
								() =>
									attemptCancellation.abort(
										new Error('Article generation stream stalled'),
									),
								receivedContent ? 30_000 : 45_000,
							);
							let next: Awaited<ReturnType<typeof reader.read>>;
							try {
								next = await readWithAbort(reader, signal);
							} finally {
								clearTimeout(idle);
							}
							if (next.done) break;
							const part = next.value;
							if (cancellation.signal.aborted) return;
							if ('providerMetadata' in part && part.providerMetadata?.gateway)
								gateway = part.providerMetadata.gateway;
							if (part.type === 'error') throw part.error;
							if (part.type === 'text-delta' || part.type === 'reasoning-delta')
								receivedContent = true;
							if (part.type === 'text-delta') controller.enqueue(part.text);
						}
					} finally {
						reader.releaseLock();
					}
					if (cancellation.signal.aborted) return;
					if (
						!completion ||
						completion.finishReason !== 'stop' ||
						!completion.text.trim()
					) {
						throw Object.assign(
							new Error(
								`Incomplete article generation: ${completion?.finishReason ?? 'aborted'}`,
							),
							{
								retryable:
									!completion ||
									completion.finishReason === 'error' ||
									completion.finishReason === 'stop',
							},
						);
					}
				} catch (error) {
					attemptCancellation.abort(error);
					if (cancellation.signal.aborted) return;
					const details = errorDetails(error);
					console.warn(
						JSON.stringify({
							event: 'article_generation_failed',
							...context,
							attempt,
							durationMs: Date.now() - startedAt,
							gateway,
							...details,
						}),
					);
					if (attempt < MAX_ATTEMPTS && isRetryable(error)) {
						// A fresh Gateway request re-routes GLM; discard the failed draft in the UI.
						controller.enqueue({ type: 'reset' });
						continue;
					}
					try {
						await onError?.({ error });
					} finally {
						controller.error(error);
					}
					return;
				} finally {
					clearTimeout(deadline);
				}

				console.log(
					JSON.stringify({
						event: 'article_generation_completed',
						...context,
						attempt,
						durationMs: Date.now() - startedAt,
						callId: completion.callId,
						gateway: completion.finalStep?.providerMetadata?.gateway,
					}),
				);
				// Persistence errors must not trigger another paid generation.
				try {
					await onEnd?.(completion);
					if (!cancellation.signal.aborted) controller.close();
				} catch (error) {
					if (!cancellation.signal.aborted) controller.error(error);
				}
				return;
			}
		},
		cancel() {
			cancellation.abort();
		},
	});
}

// Abort must unblock reads even when an upstream stream ignores cancellation.
function readWithAbort<T>(
	reader: ReadableStreamDefaultReader<T>,
	signal: AbortSignal,
): Promise<ReadableStreamReadResult<T>> {
	return new Promise((resolve, reject) => {
		const abort = () => {
			reject(signal.reason);
			void reader.cancel().catch(() => undefined);
		};
		if (signal.aborted) {
			abort();
			return;
		}
		signal.addEventListener('abort', abort, { once: true });
		reader
			.read()
			.then(resolve, reject)
			.finally(() => signal.removeEventListener('abort', abort));
	});
}

function errorDetails(error: unknown) {
	if (!(error instanceof Error)) return { message: String(error) };
	const details = error as Error & {
		statusCode?: number;
		providerMetadata?: unknown;
	};
	return {
		name: details.name,
		message: details.message,
		statusCode: details.statusCode,
		providerMetadata: details.providerMetadata,
	};
}

function isRetryable(error: unknown): boolean {
	const details = error as { retryable?: boolean; statusCode?: number } | null;
	if (details?.retryable === false) return false;
	const status = details?.statusCode;
	return (
		status === undefined || status === 408 || status === 429 || status >= 500
	);
}
