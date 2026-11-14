import { beforeEach, describe, expect, test, vi } from 'vitest';

interface PersistedUniverseValues {
	name: string;
	slug: string;
	prompt: string;
}

const { returning, onConflictDoNothing, values, insert } = vi.hoisted(() => {
	const returning = vi.fn();
	const onConflictDoNothing = vi.fn(() => ({ returning }));
	const values = vi.fn((_value: PersistedUniverseValues) => ({
		onConflictDoNothing,
	}));
	const insert = vi.fn(() => ({ values }));

	return { returning, onConflictDoNothing, values, insert };
});

vi.mock('@/db', () => ({
	db: { insert },
}));

import { universes } from '@/db/schema/universe';
import { persistUniverse } from './persistUniverse';

describe('persistUniverse', () => {
	beforeEach(() => {
		returning.mockReset();
		onConflictDoNothing.mockClear();
		values.mockClear();
		insert.mockClear();
	});

	test('persists a Unicode slug without a suffix when it is available', async () => {
		returning.mockResolvedValue([{ slug: '무인궤도의-연대' }]);

		await expect(
			persistUniverse({
				name: '무인궤도의 연대',
				prompt: 'A chronicle of abandoned orbital habitats',
			}),
		).resolves.toBe('무인궤도의-연대');
		expect(values).toHaveBeenCalledWith({
			name: '무인궤도의 연대',
			slug: '무인궤도의-연대',
			prompt: 'A chronicle of abandoned orbital habitats',
		});
		expect(onConflictDoNothing).toHaveBeenCalledWith({
			target: universes.slug,
		});
	});

	test('uses a non-empty fallback for punctuation-only names', async () => {
		returning.mockImplementation(async () => [values.mock.lastCall?.[0]]);

		const slug = await persistUniverse({
			name: '✨ — !!!',
			prompt: 'A world described only through impossible symbols',
		});

		expect(slug).toMatch(/^universe-[0-9a-f]{12}$/);
		expect(values).toHaveBeenCalledWith(
			expect.objectContaining({ slug: expect.stringMatching(/^universe-/) }),
		);
	});

	test('retries a colliding slug with a unique suffix', async () => {
		returning
			.mockResolvedValueOnce([])
			.mockImplementationOnce(async () => [values.mock.lastCall?.[0]]);

		const slug = await persistUniverse({
			name: 'Shared Dream',
			prompt: 'Another world whose generated name already exists',
		});

		expect(slug).toMatch(/^shared-dream-[0-9a-f]{12}$/);
		expect(values.mock.calls.map(([value]) => value.slug)).toEqual([
			'shared-dream',
			slug,
		]);
	});

	test('fails after bounded retries when every candidate collides', async () => {
		returning.mockResolvedValue([]);

		await expect(
			persistUniverse({
				name: 'Shared Dream',
				prompt: 'A stubbornly colliding generated universe',
			}),
		).rejects.toThrow('Unable to allocate a unique universe slug');
		expect(insert).toHaveBeenCalledTimes(4);
	});
});
