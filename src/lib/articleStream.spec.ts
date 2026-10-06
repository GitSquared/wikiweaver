import type { LanguageModelV4StreamPart } from '@ai-sdk/provider';
import { MockLanguageModelV4 } from 'ai/test';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { createArticleStream } from './articleStream';
import { readArticleStream } from './readArticleStream';

const usage = {
	inputTokens: { total: 10, noCache: 10, cacheRead: 0, cacheWrite: 0 },
	outputTokens: { total: 10, text: 10, reasoning: 0 },
};

function response(
	text: string,
	error?: Error,
	finishReason: 'stop' | 'content-filter' = 'stop',
) {
	return {
		stream: new ReadableStream<LanguageModelV4StreamPart>({
			start(controller) {
				controller.enqueue({ type: 'stream-start', warnings: [] });
				controller.enqueue({ type: 'text-start', id: 'text' });
				controller.enqueue({ type: 'text-delta', id: 'text', delta: text });
				if (error) controller.enqueue({ type: 'error', error });
				else {
					controller.enqueue({ type: 'text-end', id: 'text' });
					controller.enqueue({
						type: 'finish',
						finishReason: { unified: finishReason, raw: finishReason },
						usage,
						providerMetadata: {
							gateway: {
								generationId: 'gen_test',
								routing: { resolvedProvider: 'baseten' },
							},
						},
					});
				}
				controller.close();
			},
		}),
	};
}

describe('article generation recovery', () => {
	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	test('retries a broken partial stream with the same model, resets the draft, and persists only the completed result', async () => {
		const model = new MockLanguageModelV4({
			modelId: 'glm-5.3-flash',
			doStream: [
				response('Broken draft', new Error('upstream disconnected')),
				response('Complete article'),
			],
		});
		const persist = vi.fn();
		const onError = vi.fn();
		let displayed = '';
		const reset = vi.fn(() => {
			displayed = '';
		});
		await readArticleStream(
			createArticleStream({
				model,
				prompt: 'An article',
				onEnd: persist,
				onError,
			}),
			{
				onChunk: (chunk) => {
					displayed += chunk;
				},
				onReset: reset,
			},
		);
		expect(displayed).toBe('Complete article');
		expect(reset).toHaveBeenCalledOnce();
		expect(model.doStreamCalls).toHaveLength(2);
		expect(model.doStreamCalls.map((call) => call.reasoning)).toEqual([
			'low',
			'low',
		]);
		expect(persist).toHaveBeenCalledOnce();
		expect(persist.mock.calls[0][0].text).toBe('Complete article');
		expect(
			persist.mock.calls[0][0].finalStep.providerMetadata.gateway.generationId,
		).toBe('gen_test');
		expect(onError).not.toHaveBeenCalled();
	});

	test('reports failure after two broken attempts and never persists either draft', async () => {
		const model = new MockLanguageModelV4({
			doStream: [
				response('One', new Error('failure')),
				response('Two', new Error('failure')),
			],
		});
		const persist = vi.fn();
		const onError = vi.fn();
		await expect(
			readArticleStream(
				createArticleStream({
					model,
					prompt: 'An article',
					onEnd: persist,
					onError,
				}),
				{ onChunk: vi.fn() },
			),
		).rejects.toThrow('failure');
		expect(model.doStreamCalls).toHaveLength(2);
		expect(persist).not.toHaveBeenCalled();
		expect(onError).toHaveBeenCalledOnce();
	});

	test('does not retry a content-filter rejection', async () => {
		const model = new MockLanguageModelV4({
			doStream: response('Blocked', undefined, 'content-filter'),
		});
		await expect(
			readArticleStream(createArticleStream({ model, prompt: 'An article' }), {
				onChunk: vi.fn(),
			}),
		).rejects.toThrow('content-filter');
		expect(model.doStreamCalls).toHaveLength(1);
	});

	test('does not retry an authentication error', async () => {
		const error = Object.assign(new Error('Unauthorized'), { statusCode: 401 });
		const model = new MockLanguageModelV4({ doStream: response('', error) });
		await expect(
			readArticleStream(createArticleStream({ model, prompt: 'An article' }), {
				onChunk: vi.fn(),
			}),
		).rejects.toThrow('Unauthorized');
		expect(model.doStreamCalls).toHaveLength(1);
	});

	test('honors the remaining overall budget rather than restarting the clock on retry', async () => {
		vi.useFakeTimers();
		const model = new MockLanguageModelV4({
			doStream: [
				{ stream: new ReadableStream<LanguageModelV4StreamPart>() },
				{ stream: new ReadableStream<LanguageModelV4StreamPart>() },
			],
		});
		const reading = readArticleStream(
			createArticleStream({
				model,
				prompt: 'An article',
				deadlineAt: Date.now() + 50_000,
			}),
			{ onChunk: vi.fn(), onReset: vi.fn() },
		);
		const rejected = expect(reading).rejects.toThrow('time budget exhausted');
		await vi.advanceTimersByTimeAsync(50_001);
		await rejected;
		expect(model.doStreamCalls).toHaveLength(2);
	});

	test('does not regenerate when persistence fails', async () => {
		const model = new MockLanguageModelV4({
			doStream: response('Complete article'),
		});
		await expect(
			readArticleStream(
				createArticleStream({
					model,
					prompt: 'An article',
					onEnd: () => {
						throw new Error('database unavailable');
					},
				}),
				{ onChunk: vi.fn() },
			),
		).rejects.toThrow('database unavailable');
		expect(model.doStreamCalls).toHaveLength(1);
	});

	test('retries a stalled stream before the function deadline', async () => {
		vi.useFakeTimers();
		const model = new MockLanguageModelV4({
			doStream: [
				{ stream: new ReadableStream<LanguageModelV4StreamPart>() },
				response('Recovered article'),
			],
		});
		const persist = vi.fn();
		const reading = readArticleStream(
			createArticleStream({ model, prompt: 'An article', onEnd: persist }),
			{ onChunk: vi.fn(), onReset: vi.fn() },
		);
		await vi.advanceTimersByTimeAsync(45_001);
		await reading;
		expect(model.doStreamCalls).toHaveLength(2);
		expect(persist).toHaveBeenCalledOnce();
	});

	test('cancels generation without retrying or persisting when the reader leaves', async () => {
		const model = new MockLanguageModelV4({
			doStream: { stream: new ReadableStream<LanguageModelV4StreamPart>() },
		});
		const persist = vi.fn();
		const stream = createArticleStream({
			model,
			prompt: 'An article',
			onEnd: persist,
		});
		await vi.waitFor(() => expect(model.doStreamCalls).toHaveLength(1));
		await stream.cancel();
		expect(model.doStreamCalls[0].abortSignal?.aborted).toBe(true);
		expect(model.doStreamCalls).toHaveLength(1);
		expect(persist).not.toHaveBeenCalled();
	});
});
