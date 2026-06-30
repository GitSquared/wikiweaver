import { beforeEach, describe, expect, test, vi } from 'vitest';

const generateObject = vi.fn();
const streamText = vi.fn();
const searchArticles = vi.fn();

vi.mock('ai', () => ({
	generateObject,
	streamText,
}));

vi.mock('./search', () => ({
	searchArticles,
}));

describe('weave model selection', () => {
	beforeEach(() => {
		generateObject.mockReset();
		streamText.mockReset();
		searchArticles.mockReset();
	});

	test('uses nano for short structured generation and mini for articles', async () => {
		const { weaveFirstArticleTitle, weaveUniverseName, weaveWikiArticle } =
			await import('./weave');

		generateObject
			.mockResolvedValueOnce({
				object: { universeName: 'Moss Cartographers', shouldAbort: false },
			})
			.mockResolvedValueOnce({
				object: { title: 'Silver Road Gardens' },
			});
		streamText.mockReturnValue({ textStream: new ReadableStream<string>() });
		searchArticles.mockResolvedValue([]);
		const onFinish = vi.fn();
		const onError = vi.fn();

		const universe = {
			id: 'universe-id',
			createdAt: new Date(),
			name: 'Moss Cartographers',
			slug: 'moss-cartographers',
			prompt: 'A quiet moon where cartographers grow roads from silver moss',
		};

		await weaveUniverseName({ prompt: universe.prompt });
		await weaveFirstArticleTitle({ universe });
		await weaveWikiArticle({
			universe,
			title: 'Silver Road Gardens',
			onFinish,
			onError,
		});

		expect(generateObject).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({ model: 'openai/gpt-5-nano' }),
		);
		expect(generateObject).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining({ model: 'openai/gpt-5-nano' }),
		);
		expect(streamText).toHaveBeenCalledWith(
			expect.objectContaining({
				model: 'openai/gpt-5-mini',
				onFinish,
				onError,
			}),
		);
	});
});
