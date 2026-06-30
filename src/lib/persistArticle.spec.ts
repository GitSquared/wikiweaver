import { beforeEach, describe, expect, test, vi } from 'vitest';

const { returning, onConflictDoNothing, values, insert, indexArticle } =
	vi.hoisted(() => {
		const returning = vi.fn();
		const onConflictDoNothing = vi.fn(() => ({ returning }));
		const values = vi.fn(() => ({ onConflictDoNothing }));
		const insert = vi.fn(() => ({ values }));
		const indexArticle = vi.fn();

		return { returning, onConflictDoNothing, values, insert, indexArticle };
	});

vi.mock('@/db', () => ({
	db: { insert },
}));

vi.mock('./search', () => ({
	indexArticle,
}));

import { persistCompletedArticle } from './persistArticle';

const completedArticle = {
	id: 'article-id',
	createdAt: new Date('2026-06-30T09:00:00Z'),
	universeId: 'universe-id',
	slug: 'silver-road-gardens',
	title: 'Silver Road Gardens',
	text: '# Silver Road Gardens\n\nA complete article.',
};

describe('persistCompletedArticle', () => {
	beforeEach(() => {
		returning.mockReset();
		onConflictDoNothing.mockClear();
		values.mockClear();
		insert.mockClear();
		indexArticle.mockReset();
	});

	test('persists and indexes a naturally completed article', async () => {
		returning.mockResolvedValue([completedArticle]);

		await persistCompletedArticle({
			universeId: completedArticle.universeId,
			articleSlug: completedArticle.slug,
			title: completedArticle.title,
			text: completedArticle.text,
			finishReason: 'stop',
		});

		expect(values).toHaveBeenCalledWith({
			universeId: completedArticle.universeId,
			slug: completedArticle.slug,
			title: completedArticle.title,
			text: completedArticle.text,
		});
		expect(indexArticle).toHaveBeenCalledWith(completedArticle);
	});

	test.each([
		'length',
		'content-filter',
		'error',
	] as const)('does not persist a generation finished with %s', async (finishReason) => {
		await expect(
			persistCompletedArticle({
				universeId: completedArticle.universeId,
				articleSlug: completedArticle.slug,
				title: completedArticle.title,
				text: completedArticle.text,
				finishReason,
			}),
		).rejects.toThrow(`Incomplete article generation: ${finishReason}`);

		expect(insert).not.toHaveBeenCalled();
		expect(indexArticle).not.toHaveBeenCalled();
	});

	test('does not persist an empty completion', async () => {
		await expect(
			persistCompletedArticle({
				universeId: completedArticle.universeId,
				articleSlug: completedArticle.slug,
				title: completedArticle.title,
				text: '   ',
				finishReason: 'stop',
			}),
		).rejects.toThrow('Article generation returned no text');

		expect(insert).not.toHaveBeenCalled();
		expect(indexArticle).not.toHaveBeenCalled();
	});

	test('does not index when another generation wins the insert race', async () => {
		returning.mockResolvedValue([]);

		await persistCompletedArticle({
			universeId: completedArticle.universeId,
			articleSlug: completedArticle.slug,
			title: completedArticle.title,
			text: completedArticle.text,
			finishReason: 'stop',
		});

		expect(indexArticle).not.toHaveBeenCalled();
	});
});
