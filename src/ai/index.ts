import { openai } from '@ai-sdk/openai';

export const DEFAULT_MODEL = openai('gpt-5-mini');
export const DEFAULT_EMBEDDING_MODEL = openai.embedding(
	'text-embedding-3-small',
);
export const DEFAULT_EMBEDDING_DIMENSIONS = 1536;
