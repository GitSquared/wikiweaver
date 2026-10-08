import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { userInfo } from 'node:os';
import { promisify } from 'node:util';
import { PgDialect } from 'drizzle-orm/pg-core';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { GENERATION_LIMITS, generationClient } from './generationPolicy';

const { execute, requestHeaders } = vi.hoisted(() => ({
	execute: vi.fn(),
	requestHeaders: vi.fn(),
}));
vi.mock('@/db', () => ({ db: { execute } }));
vi.mock('next/headers', () => ({ headers: requestHeaders }));

import { admitGeneration } from './generationGuard';

const dialect = new PgDialect();
const run = promisify(execFile);
const socket = process.env.GENERATION_GUARD_TEST_SOCKET;
const counters = new Map<string, number>();
const epoch = Date.now();
const burstLimit = GENERATION_LIMITS[0].limit;
async function query(text: string) {
	const { stdout } = await run('psql', [
		'-X',
		'-h',
		socket ?? '',
		'-d',
		'postgres',
		'-U',
		userInfo().username,
		'-At',
		'-v',
		'ON_ERROR_STOP=1',
		'-c',
		text,
	]);
	return stdout;
}

beforeEach(async () => {
	vi.restoreAllMocks();
	vi.spyOn(Date, 'now').mockReturnValue(epoch);
	vi.stubEnv('GENERATION_IDENTITY_SECRET', 'test-secret');
	vi.spyOn(console, 'log').mockImplementation(() => {});
	vi.spyOn(console, 'error').mockImplementation(() => {});
	requestHeaders.mockResolvedValue(
		new Headers({
			'user-agent': 'Mozilla/5.0',
			'x-forwarded-for': '192.0.2.1',
		}),
	);
	execute.mockReset();
	counters.clear();
	if (socket) {
		await query(
			await readFile(
				new URL(
					'../../migrations/20261009_generation_guard.sql',
					import.meta.url,
				),
				'utf8',
			),
		);
		await query('TRUNCATE "generationWindows"');
	}
	execute.mockImplementation(async (statement) => {
		const { sql, params } = dialect.sqlToQuery(statement);
		if (socket) {
			// Test-only SQL literal substitution; fixture parameters never contain secrets.
			const text = sql.replace(/\$(\d+)/g, (_, n) =>
				typeof params[Number(n) - 1] === 'number'
					? String(params[Number(n) - 1])
					: `'${String(params[Number(n) - 1]).replace(/'/g, "''")}'`,
			);
			const output = await query(text);
			return {
				rows: sql.includes('RETURNING')
					? output
							.split('\n')
							.filter((s) => /^\d+$/.test(s))
							.map((count) => ({ count: Number(count) }))
					: [],
			};
		}
		if (!sql.includes('INSERT')) return { rows: [] };
		const key = String(params[0]);
		const count = counters.get(key) ?? 0;
		const limit = sql.includes('RETURNING')
			? Number(params[5])
			: Number.POSITIVE_INFINITY;
		if (count >= limit) return { rows: [] };
		counters.set(key, count + 1);
		return { rows: [{ count: count + 1 }] };
	});
});

async function seed(scope: string, count: number) {
	const start = Math.floor(epoch / 86_400_000) * 86_400_000;
	const client = generationClient(await requestHeaders(), 'test-secret', epoch);
	const key = `${scope}:${start}:${scope === 'global-day' ? 'all' : client.id}`;
	if (socket)
		await query(
			`INSERT INTO "generationWindows" ("key","count","expiresAt","category","userAgent","country") VALUES ('${key}',${count},now()+interval '1 day','browser','','') ON CONFLICT ("key") DO UPDATE SET "count"=${count}`,
		);
	else counters.set(key, count);
}

describe('generation admission', () => {
	test.each([
		['client-day', GENERATION_LIMITS[1].limit],
		['global-day', GENERATION_LIMITS[2].limit],
	] as const)('enforces %s even when the burst allowance remains', async (scope, count) => {
		await seed(scope, count);
		const result = await admitGeneration('article:test/one');
		expect(result.allowed).toBe(false);
		expect(console.log).toHaveBeenLastCalledWith(
			expect.stringContaining(scope),
		);
	});
	test('the burst window resets', async () => {
		for (let i = 0; i < burstLimit; i++)
			await admitGeneration('article:test/one');
		expect((await admitGeneration('article:test/one')).allowed).toBe(false);
		vi.mocked(Date.now).mockReturnValue(epoch + 600_000);
		expect((await admitGeneration('article:test/one')).allowed).toBe(true);
	});

	test('limits simultaneous admissions across callers, without exceeding the configured allowance', async () => {
		const results = await Promise.all(
			Array.from({ length: burstLimit + 4 }, () =>
				admitGeneration('article:test/one'),
			),
		);
		expect(results.filter((r) => r.allowed)).toHaveLength(burstLimit);
		const rejected = results.find((r) => !r.allowed);
		expect(rejected).toMatchObject({ allowed: false });
		if (rejected && !rejected.allowed)
			expect(rejected.retryAfterSeconds).toBeGreaterThan(0);
	});
	test('declared crawlers and prefetches are recorded but never spend an allowance', async () => {
		for (const h of [
			new Headers({ 'user-agent': 'GPTBot' }),
			new Headers({ purpose: 'prefetch' }),
		]) {
			execute.mockClear();
			requestHeaders.mockResolvedValue(h);
			expect((await admitGeneration('article:test/one')).allowed).toBe(false);
			const sqls = execute.mock.calls.map(([s]) => dialect.sqlToQuery(s));
			expect(sqls.some((s) => s.sql.includes('RETURNING'))).toBe(false);
			expect(String(sqls[0].params[0])).toContain('observed:');
		}
	});
	test('automation with a browser-spoofed agent still hits the rate limit', async () => {
		const results = [];
		for (let i = 0; i < burstLimit + 1; i++)
			results.push(await admitGeneration('article:test/one'));
		expect(results.at(-1)?.allowed).toBe(false);
	});
	test('a database failure stops paid generation and returns a readable message', async () => {
		execute.mockRejectedValue(new Error('database unavailable'));
		expect(await admitGeneration('article:test/one')).toMatchObject({
			allowed: false,
			message: expect.stringContaining('temporarily unavailable'),
		});
	});
	test('different addresses have independent burst allowances', async () => {
		for (let i = 0; i < burstLimit; i++)
			await admitGeneration('article:test/one');
		requestHeaders.mockResolvedValue(
			new Headers({
				'x-forwarded-for': '192.0.2.2',
				'user-agent': 'Mozilla/5.0',
			}),
		);
		expect((await admitGeneration('article:test/two')).allowed).toBe(true);
	});
});
