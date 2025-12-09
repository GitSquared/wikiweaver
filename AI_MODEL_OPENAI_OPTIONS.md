# OpenAI Model Options for WikiWeaver

This guide focuses exclusively on OpenAI models, for teams that want to stay within the OpenAI ecosystem.

## Current Configuration

WikiWeaver uses **GPT-4o-mini** with the **text-embedding-3-small** embedding model.

```typescript
// src/ai/index.ts
export const DEFAULT_MODEL = openai('gpt-4o-mini');
export const DEFAULT_EMBEDDING_MODEL = openai.embedding('text-embedding-3-small');
export const DEFAULT_EMBEDDING_DIMENSIONS = 1536;
```

---

## OpenAI Model Comparison

### Content Generation Models

| Model | Cost (Input/Output per 1M tokens) | Context Window | Speed | Best For |
|-------|----------------------------------|----------------|-------|----------|
| **gpt-4o-mini** ⭐ | $0.15 / $0.60 | 128k | Very Fast | Current choice - excellent balance |
| **gpt-4o** | $2.50 / $10.00 | 128k | Moderate | Premium quality creative writing |
| **gpt-4-turbo** | $10.00 / $30.00 | 128k | Moderate | Legacy option (use gpt-4o instead) |
| **o1-preview** | $15.00 / $60.00 | 128k | Slow | Complex reasoning (overkill for this use case) |
| **o1-mini** | $3.00 / $12.00 | 128k | Moderate | Reasoning-focused (not ideal for creative writing) |

### Embedding Models

| Model | Cost per 1M tokens | Dimensions | Best For |
|-------|-------------------|------------|----------|
| **text-embedding-3-small** ⭐ | $0.02 | 1536 | Current choice - cost-effective |
| **text-embedding-3-large** | $0.13 | 3072 | Higher accuracy search |
| **text-embedding-ada-002** | $0.10 | 1536 | Legacy (use v3 instead) |

---

## Recommended OpenAI Options

### Option 1: GPT-4o (Quality Upgrade) ✨

**When to use:** You want significantly better creative writing without leaving OpenAI

**Cost Impact:** ~17x more expensive ($0.83 → $13.75 per 1K articles)

**Benefits:**
- Much better creative writing and storytelling
- More coherent long-form content
- Better at maintaining consistency across related articles
- Improved world-building logic
- Better content moderation reasoning

**Implementation:**
```typescript
// src/ai/index.ts
export const DEFAULT_MODEL = openai('gpt-4o');
// Keep the same embedding model
export const DEFAULT_EMBEDDING_MODEL = openai.embedding('text-embedding-3-small');
export const DEFAULT_EMBEDDING_DIMENSIONS = 1536;
```

**No other changes needed!** This is a drop-in replacement.

---

### Option 2: text-embedding-3-large (Search Upgrade) 🔍

**When to use:** You want better search accuracy for finding related articles

**Cost Impact:** Minimal increase (embeddings are ~2% of total cost)

**Benefits:**
- Better semantic search quality
- More accurate article reference matching
- Improved context retrieval for article generation

**Implementation:**
```typescript
// src/ai/index.ts
export const DEFAULT_MODEL = openai('gpt-4o-mini'); // Keep current
export const DEFAULT_EMBEDDING_MODEL = openai.embedding('text-embedding-3-large');
export const DEFAULT_EMBEDDING_DIMENSIONS = 3072; // IMPORTANT: Changed from 1536
```

**Database Schema Update Required:**

```typescript
// src/db/schema/paragraph.ts
// Update the embedding vector dimensions from 1536 to 3072
// Example: vector('embedding', { dimensions: 3072 })
```

Then run:
```bash
npm run push-db
```

**⚠️ Breaking Change:** Existing embeddings will need to be regenerated. This is a database migration.

---

### Option 3: Hybrid Approach (Balanced) ⚖️

**When to use:** You want better quality without breaking the bank

**Strategy:** Use GPT-4o selectively for specific tasks

**Implementation:**
```typescript
// src/ai/index.ts
import { openai } from '@ai-sdk/openai';

// Use GPT-4o for complex creative tasks
export const PREMIUM_MODEL = openai('gpt-4o');
// Keep mini for simpler tasks
export const DEFAULT_MODEL = openai('gpt-4o-mini');

export const DEFAULT_EMBEDDING_MODEL = openai.embedding('text-embedding-3-small');
export const DEFAULT_EMBEDDING_DIMENSIONS = 1536;
```

Then in `src/lib/weave.ts`, use the premium model selectively:

```typescript
import { DEFAULT_MODEL, PREMIUM_MODEL } from '@/ai';

// Use premium model for article generation (most important for quality)
export async function weaveWikiArticle({ universe, title }: { universe: Universe; title: string }) {
	// ... existing code ...
	
	const { textStream } = streamText({
		model: PREMIUM_MODEL, // Use GPT-4o here
		prompt,
	});
	
	return { textStream };
}

// Keep mini for universe names (simple task)
export async function weaveUniverseName({ prompt }: { prompt: string }) {
	const { object } = await generateObject({
		model: DEFAULT_MODEL, // Keep GPT-4o-mini here
		schema: z.object({
			universeName: z.string().min(4).max(50),
			shouldAbort: z.boolean().optional(),
		}),
		prompt: // ... existing prompt ...
	});
	// ... rest of function
}

// Keep mini for titles (simple task)
export async function weaveFirstArticleTitle({ universe }: { universe: Universe }) {
	const { object } = await generateObject({
		model: DEFAULT_MODEL, // Keep GPT-4o-mini here
		// ... existing code ...
	});
	// ... rest of function
}
```

**Cost Impact:** ~4x increase ($0.84 → $3.34 per 1K articles)
- 60% of the benefit of full GPT-4o at 25% of the cost increase

---

### Option 4: Environment-Based Configuration 🔧

**When to use:** You want flexibility to switch models without code changes

**Implementation:**
```typescript
// src/ai/index.ts
import { openai } from '@ai-sdk/openai';

type OpenAIModel = 'gpt-4o-mini' | 'gpt-4o' | 'gpt-4-turbo';
type OpenAIEmbedding = 'text-embedding-3-small' | 'text-embedding-3-large' | 'text-embedding-ada-002';

const MODEL_NAME = (process.env.OPENAI_MODEL || 'gpt-4o-mini') as OpenAIModel;
const EMBEDDING_NAME = (process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small') as OpenAIEmbedding;

export const DEFAULT_MODEL = openai(MODEL_NAME);
export const DEFAULT_EMBEDDING_MODEL = openai.embedding(EMBEDDING_NAME);

// Dimensions depend on the embedding model
const EMBEDDING_DIMENSIONS_MAP: Record<OpenAIEmbedding, number> = {
	'text-embedding-3-small': 1536,
	'text-embedding-3-large': 3072,
	'text-embedding-ada-002': 1536,
};

export const DEFAULT_EMBEDDING_DIMENSIONS = EMBEDDING_DIMENSIONS_MAP[EMBEDDING_NAME];
```

Then configure via environment variables:

```bash
# .env.local

# For GPT-4o
OPENAI_MODEL=gpt-4o

# For large embeddings
OPENAI_EMBEDDING_MODEL=text-embedding-3-large
```

---

## Cost Analysis: OpenAI Options

Assuming average article generation:
- Input: ~1,500 tokens (universe context + prompt + references)
- Output: ~1,000 tokens (article content)
- Embeddings: ~200 tokens per paragraph (3 paragraphs per article)

### Per 1,000 Articles Cost Breakdown

| Configuration | Generation | Embeddings | Total | vs Current |
|--------------|-----------|------------|-------|------------|
| **Current (4o-mini + small)** | $0.83 | $0.01 | **$0.84** | Baseline |
| GPT-4o + small | $13.75 | $0.01 | **$13.76** | +1,539% |
| 4o-mini + large | $0.83 | $0.08 | **$0.91** | +8% |
| GPT-4o + large | $13.75 | $0.08 | **$13.83** | +1,546% |
| **Hybrid (4o articles + mini other)** | $3.33 | $0.01 | **$3.34** | +298% |

### Monthly Cost Estimates (by usage)

| Articles/Month | Current | GPT-4o Full | Hybrid | 4o-mini + Large Embed |
|----------------|---------|-------------|--------|----------------------|
| 1,000 | $0.84 | $13.76 | $3.34 | $0.91 |
| 10,000 | $8.40 | $137.60 | $33.40 | $9.10 |
| 100,000 | $84 | $1,376 | $334 | $91 |
| 1,000,000 | $840 | $13,760 | $3,340 | $910 |

---

## Recommendations by Priority

### 🎯 For Immediate Cost Reduction
**Keep current setup** - GPT-4o-mini is already one of the most cost-effective options available. You're getting excellent value.

### 🎨 For Better Creative Quality
**Option 1: Full GPT-4o** - Best creative writing, but expensive  
**Option 3: Hybrid approach** - 60% of the quality improvement at 25% of the cost

### 🔍 For Better Search/Coherence
**Option 2: text-embedding-3-large** - Minimal cost increase, better article references

### 🧪 For Experimentation
**Option 4: Environment-based** - Easy A/B testing between models

---

## Testing Your Model Choice

### 1. Create a Test Universe
```bash
# Create a universe with a rich, complex theme
Theme: "A world where medieval knights discovered quantum mechanics"
```

### 2. Generate Sample Articles
Create 5-10 articles and evaluate:
- **Creativity:** Are concepts unique and interesting?
- **Consistency:** Do articles reference each other logically?
- **Depth:** Is the content detailed enough?
- **Tone:** Does it maintain encyclopedia style?

### 3. Compare Outputs
Run the same prompts with different models:
```typescript
// Test script
const models = ['gpt-4o-mini', 'gpt-4o'];
for (const model of models) {
	process.env.OPENAI_MODEL = model;
	// Generate article and compare
}
```

### 4. Monitor Performance
```typescript
// Add timing to src/lib/weave.ts
const startTime = Date.now();
const result = await streamText({ model: DEFAULT_MODEL, prompt });
console.log(`Generated in ${Date.now() - startTime}ms with ${MODEL_NAME}`);
```

---

## Production Considerations

### Rate Limiting
OpenAI has tiered rate limits. Higher tier = higher limits:
- **Free tier:** 3 RPM (requests per minute)
- **Tier 1:** 500 RPM / 30K TPM (tokens per minute)
- **Tier 2:** 5,000 RPM / 450K TPM
- **Tier 5:** 10,000 RPM / 30M TPM

For production, ensure you're at least Tier 1 ($5+ spent).

### Error Handling
```typescript
// In src/lib/weave.ts
import { openai } from '@ai-sdk/openai';

const MAX_RETRIES = 3;
const FALLBACK_MODEL = openai('gpt-4o-mini');

async function generateWithFallback(prompt: string, model = DEFAULT_MODEL) {
	for (let i = 0; i < MAX_RETRIES; i++) {
		try {
			return await streamText({ model, prompt });
		} catch (error) {
			if (i === MAX_RETRIES - 1) {
				// Last attempt: try fallback model
				console.warn('Primary model failed, using fallback');
				return await streamText({ model: FALLBACK_MODEL, prompt });
			}
			await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
		}
	}
}
```

### Caching Optimization
OpenAI has prompt caching for repeated content:
```typescript
// Potential future optimization
// Cache universe context across multiple article generations
```

---

## Not Recommended for WikiWeaver

### ❌ O1-Preview / O1-Mini
- **Why:** These are reasoning models, not creative writing models
- **Cost:** 20-100x more expensive than GPT-4o-mini
- **Speed:** Much slower (adds reasoning time)
- **Use case:** Complex problem-solving, not creative content

### ❌ GPT-4-Turbo
- **Why:** GPT-4o is better and cheaper
- **Status:** Legacy model, being phased out
- **Recommendation:** Use GPT-4o instead

### ❌ GPT-3.5-Turbo
- **Why:** Lower quality than GPT-4o-mini at similar price
- **Status:** Deprecated (as of Jan 2025)
- **Recommendation:** Stick with GPT-4o-mini

---

## Quick Decision Matrix

**Choose GPT-4o-mini if:**
- ✅ Cost is a primary concern
- ✅ Current quality is acceptable
- ✅ You need fast generation
- ✅ You're serving high volume

**Upgrade to GPT-4o if:**
- ✅ Quality is more important than cost
- ✅ You want the best creative writing
- ✅ You can afford 17x cost increase
- ✅ You're serving low-medium volume

**Try Hybrid approach if:**
- ✅ You want better quality without full cost
- ✅ Some tasks are more important than others
- ✅ You can modify the codebase
- ✅ You want gradual quality improvement

**Upgrade embeddings if:**
- ✅ Search relevance is important
- ✅ Article coherence needs improvement
- ✅ Cost increase is negligible for you
- ✅ You can handle database migration

---

## FAQ

**Q: Can I use different models for different universes?**  
A: Yes! You could add a `preferredModel` field to the Universe schema and switch models based on that.

**Q: Does GPT-4o support streaming like 4o-mini?**  
A: Yes, all OpenAI models support streaming with the Vercel AI SDK.

**Q: Will my prompts work the same on GPT-4o?**  
A: Yes, GPT-4o is designed to be compatible with GPT-4o-mini prompts.

**Q: How do I track costs in production?**  
A: Check your OpenAI dashboard, or integrate observability tools like Helicone or Langfuse.

**Q: Can I mix models in the same article generation?**  
A: Not directly, but you could use GPT-4o for the main content and mini for related suggestions.

---

## Next Steps

1. **Decide your priority:** Cost, quality, or balance?
2. **Choose your option** from the recommendations above
3. **Test locally** with a few universes
4. **Measure impact:** Cost, speed, quality
5. **Deploy gradually:** Maybe start with 10% of traffic
6. **Monitor and adjust**

## Resources

- [OpenAI Model Pricing](https://openai.com/api/pricing/)
- [OpenAI Model Documentation](https://platform.openai.com/docs/models)
- [Vercel AI SDK - OpenAI Provider](https://sdk.vercel.ai/providers/ai-sdk-providers/openai)
- [OpenAI Usage Tiers](https://platform.openai.com/docs/guides/rate-limits)

---

**Bottom Line:** GPT-4o-mini is an excellent choice. Only upgrade if you specifically need better creative writing quality and can justify the cost increase. The hybrid approach offers the best balance if you want to improve quality without breaking the bank.
