import { beforeEach, describe, expect, test, vi } from 'vitest';

const generateText = vi.fn();
const objectOutput = vi.fn((options) => options);
const streamText = vi.fn();
const searchArticles = vi.fn();

vi.mock('ai', () => ({
	generateText,
	Output: { object: objectOutput },
	streamText,
}));

vi.mock('./search', () => ({
	searchArticles,
}));

describe('weave model selection', () => {
	beforeEach(() => {
		generateText.mockReset();
		objectOutput.mockClear();
		streamText.mockReset();
		searchArticles.mockReset();
	});

	test('uses nano for short structured generation and mini for articles', async () => {
		const { weaveFirstArticleTitle, weaveUniverseName, weaveWikiArticle } =
			await import('./weave');

		generateText
			.mockResolvedValueOnce({
				output: { universeName: 'Moss Cartographers', shouldAbort: false },
			})
			.mockResolvedValueOnce({
				output: { title: 'Silver Road Gardens' },
			});
		streamText.mockReturnValue({ textStream: new ReadableStream<string>() });
		searchArticles.mockResolvedValue([]);
		const onEnd = vi.fn();
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
			onEnd,
			onError,
		});

		expect(generateText).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({ model: 'openai/gpt-5-nano' }),
		);
		expect(generateText).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining({ model: 'openai/gpt-5-nano' }),
		);
		expect(streamText).toHaveBeenCalledWith(
			expect.objectContaining({
				model: 'openai/gpt-5-mini',
				onEnd,
				onError,
			}),
		);
	});
});
