import { describe, expect, test, vi } from 'vitest';
import { readArticleStream } from './readArticleStream';

describe('readArticleStream', () => {
	test('delivers every chunk and resolves after a complete stream', async () => {
		const onChunk = vi.fn();
		const stream = new ReadableStream<string>({
			start(controller) {
				controller.enqueue('# Silver Road');
				controller.enqueue(' Gardens');
				controller.close();
			},
		});

		await readArticleStream(stream, { onChunk });

		expect(onChunk.mock.calls).toEqual([['# Silver Road'], [' Gardens']]);
	});

	test('rejects when the source stream fails', async () => {
		const stream = new ReadableStream<string>({
			start(controller) {
				controller.error(new Error('provider disconnected'));
			},
		});

		await expect(
			readArticleStream(stream, { onChunk: vi.fn() }),
		).rejects.toThrow('provider disconnected');
	});

	test('cancels without reporting an error when navigation aborts', async () => {
		const cancel = vi.fn();
		const abortController = new AbortController();
		const stream = new ReadableStream<string>({ cancel });

		const reading = readArticleStream(stream, {
			onChunk: vi.fn(),
			signal: abortController.signal,
		});
		abortController.abort();

		await expect(reading).resolves.toBeUndefined();
		expect(cancel).toHaveBeenCalledOnce();
	});
});
