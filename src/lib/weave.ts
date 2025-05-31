import { DEFAULT_MODEL } from '@/ai';
import type { universes } from '@/db/schema/universe';
import { generateObject, generateText } from 'ai';
import z from 'zod';

export async function weaveUniverseName({
	prompt,
}: { prompt: string }): Promise<string> {
	const {
		object: { universeName },
	} = await generateObject({
		model: DEFAULT_MODEL,
		schema: z.object({
			universeName: z.string().min(4).max(50),
		}),
		prompt: `Generate a name for a universe based on the following prompt: "${prompt}"`,
	});

	return universeName;
}

export async function weaveFirstArticleTitle({
	universe,
}: {
	universe: typeof universes.$inferSelect;
}): Promise<string> {
	const {
		object: { title },
	} = await generateObject({
		model: DEFAULT_MODEL,
		schema: z.object({
			title: z.string().min(4).max(50),
		}),
		prompt: `Generate a title for an article of a wiki within the universe "${universe.name}" based on its themes and lore. Here is a brief description of this universe: "${universe.prompt}". Invent any concept, event, place, object, character or so on that could warrant an encyclopedia article within that universe, and return the article's title. The title should be concise and fitting of a fictional encyclopedia.`,
	});

	return title;
}

export async function weaveWikiArticle({
	universe,
	title,
}: {
	universe: typeof universes.$inferSelect;
	title: string;
}): Promise<string> {
	const prompt = `You're writing an encyclopedia from a fictional universe. This universe is called "${universe.name}", and here is some information about it:
	
	"${universe.prompt}"

	Now, write a detailed article about "${title}" as if it were a real historical event, place, object, cultural phenomenon or concept in that world.

- Maintain a formal, Wikipedia-like tone.
- Feel free to fabricate locations, names, timelines, and organizations.
- Within the article content, wrap these invented names using double brackets like [[Name]]. These will be automatically turned into links.
- Invent at least 5 such references, but no more than 30.
- Keep the article in-universe and consistent with its lore.
- Do not mention the fictional universe's name or description directly.
- Use markdown formatting for headings, lists, and emphasis.
- Print the title of the article without any alteration.
- Write an article of at least 500 words.
- Keep internal logic and continuity consistent.
- Avoid real-world facts unless twisted into the fiction.

Begin the article now:`;

	const { text: articleText } = await generateText({
		model: DEFAULT_MODEL,
		prompt,
	});

	return articleText;
}
