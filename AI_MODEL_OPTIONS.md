# AI Model Configuration for WikiWeaver

## Current Model

WikiWeaver currently uses **OpenAI's GPT-4o-mini** for content generation.

**Configuration Location:** `src/ai/index.ts`

```typescript
export const DEFAULT_MODEL = openai('gpt-4o-mini');
export const DEFAULT_EMBEDDING_MODEL = openai.embedding('text-embedding-3-small');
```

### Current Model Characteristics

- **Model:** GPT-4o-mini
- **Provider:** OpenAI
- **Cost:** $0.15 per 1M input tokens, $0.60 per 1M output tokens
- **Context Window:** 128k tokens
- **Speed:** Very fast (optimized for low latency)
- **Quality:** Good balance between speed and quality
- **Use Cases:** Article generation, universe naming, content moderation

## Alternative Model Options

### 1. **OpenAI GPT-4o** (Upgrade)

**Best for:** Higher quality output with more nuanced creative writing

- **Cost:** $2.50 per 1M input tokens, $10.00 per 1M output tokens
- **Context Window:** 128k tokens
- **Speed:** Moderate (slower than mini)
- **Pros:**
  - Significantly better creative writing quality
  - More coherent long-form content
  - Better at maintaining consistency across articles
  - Better reasoning for content moderation
- **Cons:**
  - ~17x more expensive than gpt-4o-mini
  - Slightly slower response times

**Implementation:**
```typescript
// In src/ai/index.ts
export const DEFAULT_MODEL = openai('gpt-4o');
```

---

### 2. **Anthropic Claude 3.5 Sonnet**

**Best for:** High-quality creative writing with strong reasoning

- **Cost:** $3.00 per 1M input tokens, $15.00 per 1M output tokens
- **Context Window:** 200k tokens
- **Speed:** Moderate
- **Pros:**
  - Excellent creative writing capabilities
  - Strong at maintaining consistency and world-building
  - Larger context window for reference articles
  - Good at following complex instructions
  - Strong content safety features
- **Cons:**
  - Most expensive option
  - Requires additional dependency setup

**Implementation:**
```bash
npm install @ai-sdk/anthropic
```

```typescript
// In src/ai/index.ts
import { anthropic } from '@ai-sdk/anthropic';

export const DEFAULT_MODEL = anthropic('claude-3-5-sonnet-20241022');

// Note: Claude doesn't have a direct embedding model
// You may want to keep OpenAI for embeddings:
export const DEFAULT_EMBEDDING_MODEL = openai.embedding('text-embedding-3-small');
```

**Environment Variables:**
```bash
ANTHROPIC_API_KEY=your_api_key_here
```

---

### 3. **Anthropic Claude 3.5 Haiku**

**Best for:** Cost-effective alternative with good quality

- **Cost:** $0.80 per 1M input tokens, $4.00 per 1M output tokens
- **Context Window:** 200k tokens
- **Speed:** Very fast
- **Pros:**
  - Faster than GPT-4o-mini
  - Better creative writing than GPT-4o-mini
  - Larger context window
  - More cost-effective than Sonnet
- **Cons:**
  - Still more expensive than GPT-4o-mini
  - Requires additional dependency

**Implementation:**
```typescript
// In src/ai/index.ts
import { anthropic } from '@ai-sdk/anthropic';

export const DEFAULT_MODEL = anthropic('claude-3-5-haiku-20241022');
```

---

### 4. **Google Gemini 2.0 Flash**

**Best for:** Fast, cost-effective generation with good quality

- **Cost:** $0.075 per 1M input tokens, $0.30 per 1M output tokens
- **Context Window:** 1M tokens (!)
- **Speed:** Very fast
- **Pros:**
  - Cheapest option by far
  - Massive context window (could reference many articles)
  - Very fast response times
  - Good multimodal capabilities (if you add images later)
- **Cons:**
  - Creative writing may be less polished than Claude/GPT-4
  - Requires additional dependency setup

**Implementation:**
```bash
npm install @ai-sdk/google
```

```typescript
// In src/ai/index.ts
import { google } from '@ai-sdk/google';

export const DEFAULT_MODEL = google('gemini-2.0-flash-exp');

// Note: Google has its own embedding model
export const DEFAULT_EMBEDDING_MODEL = google.textEmbeddingModel('text-embedding-004');
```

**Environment Variables:**
```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

---

### 5. **xAI Grok Beta**

**Best for:** Experimental, high-quality creative content

- **Cost:** $5.00 per 1M input tokens, $15.00 per 1M output tokens
- **Context Window:** 131k tokens
- **Speed:** Moderate
- **Pros:**
  - Known for creative and engaging outputs
  - Good at humor and unconventional content
  - Might be interesting for alternate universe fiction
- **Cons:**
  - Most expensive option
  - Still in beta (less stable)
  - Requires additional dependency

**Implementation:**
```bash
npm install @ai-sdk/xai
```

```typescript
// In src/ai/index.ts
import { xai } from '@ai-sdk/xai';

export const DEFAULT_MODEL = xai('grok-beta');
```

**Environment Variables:**
```bash
XAI_API_KEY=your_api_key_here
```

---

## Recommendations

### For Production Use

**Best Overall:** **Claude 3.5 Haiku**
- Sweet spot between quality and cost
- Excellent creative writing
- Fast response times
- Larger context for better article coherence

**Most Cost-Effective:** **Google Gemini 2.0 Flash**
- Half the cost of GPT-4o-mini
- Massive context window allows referencing many articles
- Very fast
- Good enough quality for most use cases

**Premium Quality:** **Claude 3.5 Sonnet**
- Best creative writing and world-building
- Most coherent long-form content
- Worth the cost if quality is paramount

### Testing Approach

You can easily A/B test different models by:

1. Creating environment-based configuration:

```typescript
// In src/ai/index.ts
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';

type SupportedModel = 
	| 'gpt-4o'
	| 'gpt-4o-mini'
	| 'claude-3-5-sonnet'
	| 'claude-3-5-haiku'
	| 'gemini-2.0-flash';

const getModel = () => {
	const modelName = (process.env.AI_MODEL || 'gpt-4o-mini') as SupportedModel;
	
	switch (modelName) {
		case 'gpt-4o':
			return openai('gpt-4o');
		case 'gpt-4o-mini':
			return openai('gpt-4o-mini');
		case 'claude-3-5-sonnet':
			return anthropic('claude-3-5-sonnet-20241022');
		case 'claude-3-5-haiku':
			return anthropic('claude-3-5-haiku-20241022');
		case 'gemini-2.0-flash':
			return google('gemini-2.0-flash-exp');
		default:
			return openai('gpt-4o-mini');
	}
};

export const DEFAULT_MODEL = getModel();
```

2. Set `AI_MODEL=claude-3-5-haiku` in your environment variables to test

3. Compare article quality, generation time, and costs

### Cost Analysis (Example Usage)

Assuming average article generation:
- Input: ~1,500 tokens (universe context + prompt + references)
- Output: ~1,000 tokens (article content)

**Cost per 1,000 articles:**

| Model | Input Cost | Output Cost | Total Cost |
|-------|-----------|-------------|------------|
| GPT-4o-mini | $0.23 | $0.60 | **$0.83** |
| GPT-4o | $3.75 | $10.00 | **$13.75** |
| Claude 3.5 Haiku | $1.20 | $4.00 | **$5.20** |
| Claude 3.5 Sonnet | $4.50 | $15.00 | **$19.50** |
| Gemini 2.0 Flash | $0.11 | $0.30 | **$0.41** |
| Grok Beta | $7.50 | $15.00 | **$22.50** |

**Cost Management Recommendations:** Consider Gemini 2.0 Flash or keep GPT-4o-mini for cost management. For production deployments with cost concerns, you could also implement a BYOK (Bring Your Own Key) feature that lets users choose their preferred model, or implement usage-based rate limiting.

---

## Implementation Notes

1. All models work with the existing Vercel AI SDK (`ai` package)
2. Streaming (`streamText`) works with all options
3. Structured generation (`generateObject`) works with all options
4. You may need to adjust prompts slightly for different models
5. Consider implementing fallback logic for API failures

## References

- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Model Provider Pricing](https://sdk.vercel.ai/docs/ai-sdk-core/providers-and-models)
- [OpenAI Pricing](https://openai.com/api/pricing/)
- [Anthropic Pricing](https://www.anthropic.com/pricing)
- [Google AI Pricing](https://ai.google.dev/pricing)
