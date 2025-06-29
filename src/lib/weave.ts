import { generateObject, streamText } from 'ai';
import z from 'zod';
import { DEFAULT_MODEL } from '@/ai';
import type { Universe } from '@/db/schema/universe';
import { searchArticles } from './search';

export async function weaveUniverseName({
	prompt,
}: {
	prompt: string;
}): Promise<string> {
	const {
		object: { universeName, shouldAbort },
	} = await generateObject({
		model: DEFAULT_MODEL,
		schema: z.object({
			universeName: z.string().min(4).max(50),
			shouldAbort: z.boolean().optional(),
		}),
		prompt: `Generate a name for a universe based on the following prompt: "${prompt}". The name should be no more than 50 characters long, and should be unique, memorable, and fitting for a fictional universe. Avoid using common words or phrases. You can also raise the shouldAbort flag, by returning shouldAbort = true, if you believe that prompt to be harmful, inappropriate, or other unsuitable for a public wiki. If you raise this flag, also return "ABORT" as the universeName.`,
	});

	if (shouldAbort || universeName === 'ABORT') {
		throw new Error(`Harmful prompt detected: ${prompt}. Please be cool.`);
	}

	return universeName;
}

export async function weaveFirstArticleTitle({
	universe,
}: {
	universe: Universe;
}): Promise<string> {
	const {
		object: { title },
	} = await generateObject({
		model: DEFAULT_MODEL,
		schema: z.object({
			title: z.string().min(4).max(50),
		}),
		prompt: `Generate a title for an article of a wiki within the universe "${universe.name}" based on its themes and lore. Here is a brief description of this universe: "${universe.prompt}". Invent any concept, event, place, object, character or so on that could warrant an encyclopedia article within that universe, and return the article's title. The title should be concise and fitting of a fictional encyclopedia, and in-lore. It should not be more than 50 characters long.`,
	});

	return title;
}

export async function weaveWikiArticle({
	universe,
	title,
}: {
	universe: Universe;
	title: string;
}): Promise<{
	textStream: ReturnType<typeof streamText>['textStream'];
}> {
	const references = await searchArticles(universe.id, title).then((results) =>
		// max 10
		results.slice(0, 10),
	);

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

${
	references.length > 0
		? `Here's what's already been written about "${title}" in this universe:

${references
	.map(
		(result) => `In an article titled "${result.article.title}":
		${result.paragraphs.map((p) => `- ${p.text}`).join('\n')}`,
	)
	.join('\n\n')}

Make sure to keep your new article coherent and consistent with this existing information.
`
		: ''
}

Begin the article now:`;

	const { textStream } = streamText({
		model: DEFAULT_MODEL,
		prompt,
	});

	return {
		textStream,
	};
}
