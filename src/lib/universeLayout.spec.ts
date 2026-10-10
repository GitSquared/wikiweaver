import { beforeEach, describe, expect, test, vi } from 'vitest';

const { notFound, select } = vi.hoisted(() => ({
	notFound: vi.fn(() => {
		throw new Error('NEXT_NOT_FOUND');
	}),
	select: vi.fn(),
}));

vi.mock('@/db', () => ({ db: { select } }));
vi.mock('next/navigation', () => ({ notFound }));

import UniverseLayout from '../app/universe/[universeSlug]/layout';

beforeEach(() => {
	vi.clearAllMocks();
	select.mockReturnValue({
		from: () => ({
			where: () => ({ limit: async () => [] }),
		}),
	});
});

describe('universe layout', () => {
	test('returns the not-found boundary when the universe does not exist', async () => {
		await expect(
			UniverseLayout({
				children: null,
				params: Promise.resolve({ universeSlug: 'missing-world' }),
			}),
		).rejects.toThrow('NEXT_NOT_FOUND');

		expect(notFound).toHaveBeenCalledOnce();
	});
});
