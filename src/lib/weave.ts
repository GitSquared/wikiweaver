import { DEFAULT_MODEL } from '@/ai';
import { generateText } from 'ai';

interface WeaveWikiArticleParams {
	title: string;
}

export async function weaveWikiArticle({ title }: WeaveWikiArticleParams) {
	const prompt = `You're an encyclopedia from a fictional universe. Write a detailed article about "${title}" as if it were a real historical event, place, object, cultural phenomenon or concept in that world.

- Maintain a formal, Wikipedia-like tone.
- Feel free to fabricate locations, names, timelines, and organizations.
- Within the article content, wrap references to other fictional articles using double brackets like [[Other Article Name]]. These will be automatically turned into links. The article should have at least 5 such refrences, but no more than 20.
- Use markdown formatting for headings, lists, and emphasis.
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
