import { sql } from 'drizzle-orm';
import { headers } from 'next/headers';
import { db } from '@/db';
import {
	GENERATION_LIMITS,
	type GenerationClient,
	generationClient,
} from './generationPolicy';

export type GenerationDecision =
	| { allowed: true; client: GenerationClient }
	| { allowed: false; message: string; retryAfterSeconds?: number };

export async function admitGeneration(
	resource: string,
): Promise<GenerationDecision> {
	// A dedicated key can be configured; the database credential provides a
	// server-only fallback. Neither the key nor the IP is stored or logged.
	const secret =
		process.env.GENERATION_IDENTITY_SECRET ?? process.env.DATABASE_URL;
	if (!secret)
		return {
			allowed: false,
			message: 'Weaving is temporarily unavailable. Please try again later.',
		};
	const now = Date.now();
	const client = generationClient(await headers(), secret, now);
	let reason = 'allowed';
	let decision: GenerationDecision = { allowed: true, client };
	try {
		if (client.prefetch || client.category === 'declared-crawler') {
			reason = client.prefetch ? 'prefetch' : 'declared-crawler';
			decision = {
				allowed: false,
				message:
					'This article has not been woven yet. Open it in your browser to explore.',
			};
		} else {
			for (const policy of GENERATION_LIMITS) {
				const start =
					Math.floor(now / (policy.seconds * 1000)) * policy.seconds * 1000;
				const identity = policy.scope === 'global-day' ? 'all' : client.id;
				const result = await db.execute(sql`
					INSERT INTO "generationWindows" ("key", "count", "expiresAt", "category", "userAgent", "country")
					VALUES (${`${policy.scope}:${start}:${identity}`}, 1, ${new Date(start + policy.seconds * 1000).toISOString()}::timestamptz,
						${client.category}, ${client.userAgent}, ${client.country})
					ON CONFLICT ("key") DO UPDATE SET "count" = "generationWindows"."count" + 1
					WHERE "generationWindows"."count" < ${policy.limit}
					RETURNING "count"
				`);
				if (!result.rows.length) {
					reason = policy.scope;
					const retryAfterSeconds = Math.max(
						1,
						Math.ceil((start + policy.seconds * 1000 - now) / 1000),
					);
					decision = {
						allowed: false,
						retryAfterSeconds,
						message: `You've reached the weaving limit. Try again in ${Math.ceil(retryAfterSeconds / 60)} minutes. You can still read existing articles.`,
					};
					break;
				}
			}
		}
		// Daily aggregates make crawler/admission history survive log retention.
		// Raw IPs and prompts are deliberately absent; the identity rotates daily.
		const day = Math.floor(now / 86_400_000) * 86_400_000;
		await db.execute(sql`
			INSERT INTO "generationWindows" ("key", "count", "expiresAt", "category", "userAgent", "country")
			VALUES (${`observed:${day}:${client.id}:${reason}`}, 1, ${new Date(day + 86_400_000).toISOString()}::timestamptz,
				${client.category}, ${client.userAgent}, ${client.country})
			ON CONFLICT ("key") DO UPDATE SET "count" = "generationWindows"."count" + 1
		`);
		// Indexed cleanup keeps at most 30 days of history; no content is touched.
		await db.execute(
			sql`DELETE FROM "generationWindows" WHERE "expiresAt" < now() - interval '30 days'`,
		);
	} catch (error) {
		console.error(
			'Generation guard unavailable',
			error instanceof Error ? error.name : 'UnknownError',
		);
		reason = 'guard-unavailable';
		decision = {
			allowed: false,
			message:
				'Weaving is temporarily unavailable. Please try again later. Existing articles are still available.',
		};
	}
	console.log(
		JSON.stringify({
			event: 'generation_admission',
			resource,
			clientId: client.id,
			category: client.category,
			country: client.country,
			reason,
		}),
	);
	return decision;
}
