import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const { select, admit, weave, cleanup } = vi.hoisted(() => ({
	select: vi.fn(),
	admit: vi.fn(),
	weave: vi.fn(),
	cleanup: vi.fn(),
}));
vi.mock('@/db', () => ({ db: { select } }));
vi.mock('@/lib/generationGuard', () => ({ admitGeneration: admit }));
vi.mock('@/lib/weave', () => ({ weaveWikiArticle: weave }));
vi.mock('@/lib/removeEmptyArticlePlaceholder', () => ({
	removeEmptyArticlePlaceholder: cleanup,
}));
vi.mock('@/lib/persistArticle', () => ({ persistCompletedArticle: vi.fn() }));
vi.mock(
	'../app/universe/[universeSlug]/wiki/[articleSlug]/components/ArticleRenderer',
	() => ({ default: () => null }),
);

import Page from '../app/universe/[universeSlug]/wiki/[articleSlug]/page';

const universe = { id: 'id', slug: 'world', name: 'World', prompt: 'Trees' };
beforeEach(() => {
	vi.stubGlobal('React', React);
	vi.clearAllMocks();
	admit.mockResolvedValue({ allowed: false, message: 'Please wait.' });
});
function articleRows(rows: unknown[]) {
	return { from: () => ({ leftJoin: () => ({ where: async () => rows }) }) };
}
function universeRows() {
	return { from: () => ({ where: () => ({ limit: async () => [universe] }) }) };
}
async function result() {
	const page = await Page({
		params: Promise.resolve({ universeSlug: 'world', articleSlug: 'tree' }),
	});
	return page.props.articleTextStream;
}
describe('article generation admission', () => {
	test('existing articles bypass all generation limits', async () => {
		select.mockReturnValueOnce(
			articleRows([{ articles: { text: '# Already woven' } }]),
		);
		expect(await result()).toBe('# Already woven');
		expect(admit).not.toHaveBeenCalled();
		expect(weave).not.toHaveBeenCalled();
	});
	test('denied requests neither generate nor delete a placeholder', async () => {
		select
			.mockReturnValueOnce(
				articleRows([{ articles: { id: 'empty', text: '' } }]),
			)
			.mockReturnValueOnce(universeRows());
		expect(await result()).toEqual({ message: 'Please wait.' });
		expect(weave).not.toHaveBeenCalled();
		expect(cleanup).not.toHaveBeenCalled();
	});
	test('allowed requests preserve streaming generation', async () => {
		select
			.mockReturnValueOnce(articleRows([]))
			.mockReturnValueOnce(universeRows());
		admit.mockResolvedValue({
			allowed: true,
			client: { id: 'client', category: 'browser', country: 'FR' },
		});
		const stream = new ReadableStream();
		weave.mockResolvedValue({ textStream: stream });
		expect(await result()).toBe(stream);
		expect(weave).toHaveBeenCalledWith(
			expect.objectContaining({ universe, title: 'Tree' }),
		);
	});
});
