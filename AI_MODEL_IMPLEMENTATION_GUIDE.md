# AI Model Implementation Guide

This guide shows you how to switch AI models in WikiWeaver or make it configurable.

## Quick Start: Switching to a Different Model

### Option 1: Simple Model Switch (OpenAI only)

If you want to upgrade to GPT-4o within OpenAI:

```typescript
// src/ai/index.ts
import { openai } from '@ai-sdk/openai';

// Change this line:
export const DEFAULT_MODEL = openai('gpt-4o-mini');

// To this:
export const DEFAULT_MODEL = openai('gpt-4o');
```

No other changes needed! The existing code will work as-is.

---

### Option 2: Switch to Claude (Anthropic)

**Step 1:** Install the Anthropic provider

```bash
npm install @ai-sdk/anthropic
```

**Step 2:** Update `src/ai/index.ts`

```typescript
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';

// Use Claude for content generation
export const DEFAULT_MODEL = anthropic('claude-3-5-haiku-20241022');

// Keep OpenAI for embeddings (Claude doesn't have an embedding model)
export const DEFAULT_EMBEDDING_MODEL = openai.embedding('text-embedding-3-small');
export const DEFAULT_EMBEDDING_DIMENSIONS = 1536;
```

**Step 3:** Add API key to your environment

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-... # Still needed for embeddings
```

**Step 4:** Test it

```bash
npm run dev
```

Visit your local instance and create a new universe!

---

### Option 3: Switch to Google Gemini

**Step 1:** Install the Google provider

```bash
npm install @ai-sdk/google
```

**Step 2:** Update `src/ai/index.ts`

```typescript
import { google } from '@ai-sdk/google';

// Use Gemini for everything
export const DEFAULT_MODEL = google('gemini-2.0-flash-exp');
export const DEFAULT_EMBEDDING_MODEL = google.textEmbeddingModel('text-embedding-004');
export const DEFAULT_EMBEDDING_DIMENSIONS = 768; // Google uses 768 dimensions
```

**Step 3:** Update database schema if needed

If you switch to Google's embeddings, you need to update the embedding dimensions:

```typescript
// src/db/schema/paragraph.ts
// Change from 1536 to 768 if using Google embeddings
```

Then push the database changes:

```bash
npm run push-db
```

**Step 4:** Add API key

```bash
# .env.local
GOOGLE_GENERATIVE_AI_API_KEY=...
```

---

## Advanced: Environment-Based Configuration

Make the model configurable via environment variables without code changes.

### Step 1: Install all providers (optional - install only what you need)

```bash
npm install @ai-sdk/anthropic @ai-sdk/google
```

### Step 2: Update `src/ai/index.ts`

```typescript
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';

type ModelProvider = 'openai' | 'anthropic' | 'google';

const MODEL_PROVIDER = (process.env.AI_MODEL_PROVIDER || 'openai') as ModelProvider;
const MODEL_NAME = process.env.AI_MODEL_NAME || 'gpt-4o-mini';

function getModel() {
	switch (MODEL_PROVIDER) {
		case 'openai':
			return openai(MODEL_NAME);
		case 'anthropic':
			return anthropic(MODEL_NAME);
		case 'google':
			return google(MODEL_NAME);
		default:
			return openai('gpt-4o-mini');
	}
}

export const DEFAULT_MODEL = getModel();

// For embeddings, you might want separate configuration
const EMBEDDING_PROVIDER = (process.env.AI_EMBEDDING_PROVIDER || 'openai') as ModelProvider;

function getEmbeddingModel() {
	switch (EMBEDDING_PROVIDER) {
		case 'openai':
			return openai.embedding('text-embedding-3-small');
		case 'google':
			return google.textEmbeddingModel('text-embedding-004');
		default:
			return openai.embedding('text-embedding-3-small');
	}
}

export const DEFAULT_EMBEDDING_MODEL = getEmbeddingModel();

// Dimensions depend on the embedding model
export const DEFAULT_EMBEDDING_DIMENSIONS = EMBEDDING_PROVIDER === 'google' ? 768 : 1536;
```

### Step 3: Configure via environment

```bash
# .env.local

# For OpenAI GPT-4o
AI_MODEL_PROVIDER=openai
AI_MODEL_NAME=gpt-4o

# For Claude 3.5 Haiku
AI_MODEL_PROVIDER=anthropic
AI_MODEL_NAME=claude-3-5-haiku-20241022
AI_EMBEDDING_PROVIDER=openai  # Keep OpenAI for embeddings

# For Google Gemini
AI_MODEL_PROVIDER=google
AI_MODEL_NAME=gemini-2.0-flash-exp
AI_EMBEDDING_PROVIDER=google
```

### Step 4: Set appropriate API keys

```bash
# .env.local
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GENERATIVE_AI_API_KEY=...
```

---

## Testing Different Models

### Qualitative Testing

1. Create a test universe with a specific theme (e.g., "A world where cats rule")
2. Generate 3-5 articles
3. Evaluate:
   - **Creativity:** Are the concepts interesting?
   - **Consistency:** Do articles reference each other correctly?
   - **Style:** Does it maintain encyclopedia tone?
   - **Coherence:** Does the world-building make sense?

### Performance Testing

```typescript
// Add to src/lib/weave.ts for timing
const startTime = Date.now();
const result = await weaveWikiArticle({ universe, title });
const endTime = Date.now();
console.log(`Article generated in ${endTime - startTime}ms`);
```

### Cost Tracking

Consider adding usage tracking:

```typescript
// Track token usage from AI SDK
import { streamText } from 'ai';

const result = await streamText({
	model: DEFAULT_MODEL,
	prompt,
});

// Log usage after completion
result.usage.then(usage => {
	console.log('Tokens used:', usage.totalTokens);
	console.log('Cost estimate:', usage.totalTokens * COST_PER_TOKEN);
});
```

---

## Model-Specific Prompt Tuning

Different models may benefit from slightly different prompts. Here are some tips:

### For Claude (Anthropic)

Claude responds well to clear structure and explicit instructions:

```typescript
const prompt = `You are an encyclopedia writer for a fictional universe.

<universe>
Name: ${universe.name}
Description: ${universe.prompt}
</universe>

<task>
Write a detailed article about "${title}" as if it were real in this universe.
</task>

<requirements>
- Maintain formal, Wikipedia-like tone
- Fabricate locations, names, timelines
- Wrap invented names in [[double brackets]]
- Include 5-30 such references
- Article should be 500+ words
- Maintain consistency with existing lore
</requirements>

Begin the article now:`;
```

### For Gemini (Google)

Gemini works well with conversational prompts:

```typescript
const prompt = `I need you to write an encyclopedia article for a fictional universe.

The universe is called "${universe.name}" and here's what it's about:
${universe.prompt}

Now, write a detailed Wikipedia-style article about "${title}". Make it feel real within this fictional world. Remember to:
- Use a formal encyclopedia tone
- Create believable details, names, and places
- Use [[double brackets]] around 5-30 invented names for links
- Write at least 500 words
- Keep everything consistent with the universe's theme

Start with the article title and then write the article:`;
```

---

## Troubleshooting

### "Model not found" error

Make sure you've:
1. Installed the correct provider package
2. Set the correct API key in environment variables
3. Used the correct model name (check provider docs)

### Streaming not working

All Vercel AI SDK models support streaming. If it's not working:
1. Check your API key is valid
2. Check network connectivity
3. Try a simple test without references

### Different output quality

Models have different strengths:
- **GPT-4o/Sonnet:** Best for complex creative writing
- **GPT-4o-mini/Haiku:** Good balance of speed and quality
- **Gemini Flash:** Fast and coherent, but may be less creative

### Cost is too high

Options:
1. Use a cheaper model (Gemini 2.0 Flash, GPT-4o-mini)
2. Reduce output length in prompts
3. Cache frequently used universes
4. Implement rate limiting per user
5. Consider the BYOK (Bring Your Own Key) approach

---

## Production Recommendations

### Rate Limiting

```typescript
// Consider adding to API routes
import { ratelimit } from '@/lib/ratelimit'; // You'd need to implement this

export async function POST(request: Request) {
	const identifier = request.headers.get('x-forwarded-for') || 'anonymous';
	const { success } = await ratelimit.limit(identifier);
	
	if (!success) {
		return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
	}
	
	// ... rest of your handler
}
```

### Caching Strategy

WikiWeaver already caches articles in the database. Consider also:
- Caching universe summaries
- Pre-generating popular article links
- Using Redis for session-based caching

### Error Handling

```typescript
// In src/lib/weave.ts
try {
	const result = await streamText({
		model: DEFAULT_MODEL,
		prompt,
	});
	return result;
} catch (error) {
	// Log the error
	console.error('Article generation failed:', error);
	
	// Fallback to different model or return graceful error
	throw new Error('Failed to generate article. Please try again.');
}
```

### Monitoring

Consider integrating with observability tools:
- [Langfuse](https://langfuse.com/) - LLM observability
- [Helicone](https://www.helicone.ai/) - OpenAI proxy with monitoring
- [LangSmith](https://www.langchain.com/langsmith) - LLM debugging

---

## Next Steps

1. **Choose your model** based on the recommendations in `AI_MODEL_OPTIONS.md`
2. **Test locally** with a few universes and articles
3. **Measure performance** (speed, quality, cost)
4. **Deploy gradually** (maybe test with a small percentage of users first)
5. **Monitor costs** and adjust as needed

## Need Help?

- Vercel AI SDK Docs: https://sdk.vercel.ai/docs
- Model Provider Docs:
  - OpenAI: https://platform.openai.com/docs
  - Anthropic: https://docs.anthropic.com
  - Google AI: https://ai.google.dev/docs

Good luck weaving your universes! 🌌
