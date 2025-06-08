import { openai } from '@ai-sdk/openai';

export const DEFAULT_MODEL = openai('gpt-4o-mini');
export const DEFAULT_EMBEDDING_MODEL = openai.embedding(
	'text-embedding-3-small',
);
export const DEFAULT_EMBEDDING_DIMENSIONS = 1536;
