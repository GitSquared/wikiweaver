import { DEFAULT_MODEL } from '@/ai';
import { db } from '@/db';
import { articles } from '@/db/schema/article';
import { generateText } from 'ai';
import styles from './page.module.css';

export default async function Home() {
	const allArticles = await db.select().from(articles);

	const { text: aiWelcome } = await generateText({
		model: DEFAULT_MODEL,
		prompt: 'Say hello to a new WikiWeaver user!',
	});

	return (
		<main className={styles.main}>
			<h1 className={styles.title}>WikiWeaver</h1>
			<ul>
				{allArticles.map((article) => (
					<li key={article.id}>{article.title}</li>
				))}
			</ul>
			<p style={{ maxWidth: '400px' }}>{aiWelcome}</p>
		</main>
	);
}
