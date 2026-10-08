import { describe, expect, test } from 'vitest';
import { generationClient } from './generationPolicy';

describe('generation client classification', () => {
	test.each([
		'Googlebot',
		'GPTBot',
		'ClaudeBot',
		'ChatGPT-User',
		'Discordbot',
	])('recognizes declared crawler %s', (agent) => {
		expect(
			generationClient(new Headers({ 'user-agent': agent }), 'secret', 0)
				.category,
		).toBe('declared-crawler');
	});
	test.each([
		'curl/8.0',
		'python-requests/2.0',
		'Mozilla/5.0 HeadlessChrome',
	])('records automation %s without claiming verified identity', (agent) => {
		expect(
			generationClient(new Headers({ 'user-agent': agent }), 'secret', 0)
				.category,
		).toBe('automation');
	});
	test.each([
		'purpose',
		'sec-purpose',
		'next-router-prefetch',
		'next-router-segment-prefetch',
	])('detects prefetch header %s', (header) => {
		expect(
			generationClient(new Headers({ [header]: 'prefetch' }), 'secret', 0)
				.prefetch,
		).toBe(true);
	});
	test('pseudonyms rotate daily and use a secret; no IP is returned', () => {
		const h = new Headers({
			'x-forwarded-for': '192.0.2.1',
			'user-agent': 'Mozilla/5.0',
		});
		const c = generationClient(h, 'secret', 0);
		expect(c.category).toBe('browser');
		expect(c.id).toBe(generationClient(h, 'secret', 1).id);
		expect(c.id).not.toBe(generationClient(h, 'secret', 86_400_000).id);
		expect(c.id).not.toBe(generationClient(h, 'other-key', 0).id);
		expect(JSON.stringify(c)).not.toContain('192.0.2.1');
	});
	test('malformed or chained IPs share an unknown allowance, rather than choosing a spoofed address', () => {
		const unknown = generationClient(new Headers(), 'secret', 0).id;
		expect(
			generationClient(
				new Headers({ 'x-forwarded-for': '192.0.2.1, 198.51.100.1' }),
				'secret',
				0,
			).id,
		).toBe(unknown);
	});
});
