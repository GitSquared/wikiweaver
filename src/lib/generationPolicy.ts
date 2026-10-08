import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';

export interface GenerationClient {
	id: string;
	category: 'declared-crawler' | 'automation' | 'browser' | 'unknown';
	userAgent: string;
	country: string;
	prefetch: boolean;
}

// These are declarations, not verified identities. Spoofed agents still hit limits.
const CRAWLER =
	/Googlebot|bingbot|GPTBot|ChatGPT-User|OAI-SearchBot|ClaudeBot|Claude-User|Claude-SearchBot|CCBot|Bytespider|PetalBot|Amazonbot|Applebot|DuckDuckBot|YandexBot|Baiduspider|SemrushBot|AhrefsBot|facebookexternalhit|Twitterbot|LinkedInBot|Slackbot|Discordbot|TelegramBot/i;

export function generationClient(
	h: Pick<Headers, 'get' | 'has'>,
	secret: string,
	now = Date.now(),
): GenerationClient {
	const userAgent = (h.get('user-agent') ?? '').slice(0, 300);
	// Vercel overwrites this header. Do not trust arbitrary client-supplied
	// alternatives or select an attacker-supplied address from a forwarded chain.
	const address = h.get('x-forwarded-for')?.trim() ?? '';
	const ip = isIP(address) ? address : 'unknown';
	return {
		id: createHmac('sha256', secret)
			.update(`wikiweaver-generation:${Math.floor(now / 86_400_000)}:${ip}`)
			.digest('hex')
			.slice(0, 32),
		category: CRAWLER.test(userAgent)
			? 'declared-crawler'
			: /curl|wget|python|HeadlessChrome|Playwright|Puppeteer/i.test(userAgent)
				? 'automation'
				: /Mozilla\//.test(userAgent)
					? 'browser'
					: 'unknown',
		userAgent,
		country: (h.get('x-vercel-ip-country') ?? 'unknown').slice(0, 16),
		prefetch:
			h.has('next-router-prefetch') ||
			h.has('next-router-segment-prefetch') ||
			/prefetch/i.test(h.get('purpose') ?? '') ||
			/prefetch/i.test(h.get('sec-purpose') ?? ''),
	};
}

export const GENERATION_LIMITS = [
	{ scope: 'client-burst', seconds: 600, limit: 60 },
	{ scope: 'client-day', seconds: 86_400, limit: 500 },
	{ scope: 'global-day', seconds: 86_400, limit: 10_000 },
] as const;
