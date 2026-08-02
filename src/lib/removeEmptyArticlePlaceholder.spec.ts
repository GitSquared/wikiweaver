import { beforeEach, describe, expect, test, vi } from 'vitest';

const { returning, where, deleteArticle } = vi.hoisted(() => {
	const returning = vi.fn();
	const where = vi.fn(() => ({ returning }));
	const deleteArticle = vi.fn(() => ({ where }));

	return { returning, where, deleteArticle };
});

vi.mock('@/db', () => ({
	db: { delete: deleteArticle },
}));

import { removeEmptyArticlePlaceholder } from './removeEmptyArticlePlaceholder';

describe('removeEmptyArticlePlaceholder', () => {
	beforeEach(() => {
		returning.mockReset();
		where.mockClear();
		deleteArticle.mockClear();
	});

	test('leaves completed articles untouched', async () => {
		await expect(
			removeEmptyArticlePlaceholder({
				id: 'article-id',
				text: '# A completed article',
			}),
		).resolves.toBe(false);

		expect(deleteArticle).not.toHaveBeenCalled();
	});

	test('deletes an unchanged empty placeholder', async () => {
		returning.mockResolvedValue([{ id: 'article-id' }]);

		await expect(
			removeEmptyArticlePlaceholder({ id: 'article-id', text: '   ' }),
		).resolves.toBe(true);

		expect(deleteArticle).toHaveBeenCalledTimes(1);
		expect(where).toHaveBeenCalledTimes(1);
	});

	test('does not claim a placeholder changed by another request', async () => {
		returning.mockResolvedValue([]);

		await expect(
			removeEmptyArticlePlaceholder({ id: 'article-id', text: '' }),
		).resolves.toBe(false);
	});
});
