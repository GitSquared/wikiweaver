interface Candidate {
	id: string;
	articleCount: number;
}

// Stable within each UTC hour, equal turns within each pool. Smaller worlds
// get three seats; established worlds get two. Fill gaps from the other pool.
export function selectFeaturedUniverses<T extends Candidate>(
	candidates: T[],
	now = Date.now(),
): T[] {
	const hour = Math.floor(now / 3_600_000);
	const sorted = [...candidates]
		.filter((c) => c.articleCount > 0)
		.sort((a, b) => a.id.localeCompare(b.id));
	const small = sorted.filter((c) => c.articleCount <= 20);
	const established = sorted.filter((c) => c.articleCount > 20);
	const rotate = (pool: T[], seats: number) =>
		pool.length
			? Array.from(
					{ length: pool.length },
					(_, i) => pool[(hour * seats + i) % pool.length],
				)
			: [];
	const s = rotate(small, 3);
	const e = rotate(established, 2);
	const featured = [...s.slice(0, 3), ...e.slice(0, 2)];
	return [...featured, ...s.slice(3), ...e.slice(2)].slice(0, 5);
}
