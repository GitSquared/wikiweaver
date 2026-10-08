import { describe, expect, test } from 'vitest';
import { selectFeaturedUniverses } from './featuredUniverses';

const candidates = Array.from({ length: 16 }, (_, i) => ({
	id: String(i).padStart(2, '0'),
	articleCount: i < 11 ? 1 : 100,
}));
describe('featured universes', () => {
	test('gives smaller worlds three seats, with no duplicates', () => {
		const result = selectFeaturedUniverses(candidates, 0);
		expect(result).toHaveLength(5);
		expect(new Set(result.map((c) => c.id)).size).toBe(5);
		expect(result.filter((c) => c.articleCount <= 20)).toHaveLength(3);
	});
	test('stays stable within an hour, independent of database ordering', () => {
		expect(selectFeaturedUniverses(candidates, 0)).toEqual(
			selectFeaturedUniverses([...candidates].reverse(), 3_599_999),
		);
		expect(selectFeaturedUniverses(candidates, 3_600_000)).not.toEqual(
			selectFeaturedUniverses(candidates, 0),
		);
	});
	test('every eligible world receives a turn', () => {
		const seen = new Set(
			Array.from({ length: 55 }, (_, hour) =>
				selectFeaturedUniverses(candidates, hour * 3_600_000),
			)
				.flat()
				.map((c) => c.id),
		);
		expect(seen.size).toBe(candidates.length);
	});
	test('fills vacant seats, excludes empty worlds, and handles small catalogs', () => {
		expect(
			selectFeaturedUniverses(
				[{ id: 'empty', articleCount: 0 }, ...candidates.slice(0, 4)],
				0,
			),
		).toHaveLength(4);
		expect(selectFeaturedUniverses(candidates.slice(11), 0)).toHaveLength(5);
		expect(selectFeaturedUniverses([], 0)).toEqual([]);
	});
});
