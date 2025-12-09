# AI Model Quick Reference

## Current Configuration

**Model:** OpenAI GPT-4o-mini  
**Location:** `src/ai/index.ts`  
**Cost per 1K articles:** ~$0.83  
**Speed:** Very fast ⚡  
**Quality:** Good balance ✅

---

## Top Recommendations

### 🔵 Staying with OpenAI (Recommended for Simplicity)

See **AI_MODEL_OPENAI_OPTIONS.md** for detailed OpenAI-only recommendations.

**Quick OpenAI Options:**
- **GPT-4o:** Better quality, 17x cost ($13.75/1K articles) - drop-in upgrade
- **Hybrid approach:** GPT-4o for articles, mini for other tasks - 4x cost ($3.34/1K articles)
- **Better embeddings:** text-embedding-3-large - minimal cost increase

---

### 🌍 Exploring Other Providers

### 🥇 Best Value: Google Gemini 2.0 Flash
- **50% cheaper** than current model ($0.41 per 1K articles)
- Massive 1M token context window
- Very fast generation
- **Install:** `npm install @ai-sdk/google`

### 🥈 Best Quality: Claude 3.5 Haiku
- Better creative writing than GPT-4o-mini
- Fast response times
- Larger context (200k tokens)
- **Cost:** $5.20 per 1K articles (6x more expensive)
- **Install:** `npm install @ai-sdk/anthropic`

### 🥉 Premium Option: OpenAI GPT-4o
- Highest quality OpenAI model
- Significantly better creative writing
- No new dependencies needed
- **Cost:** $13.75 per 1K articles (17x more expensive)
- **Change:** Just edit model name in `src/ai/index.ts`

---

## Quick Switch Examples

### To GPT-4o (no installation needed):
```typescript
// src/ai/index.ts
export const DEFAULT_MODEL = openai('gpt-4o');
```

### To Claude 3.5 Haiku:
```bash
npm install @ai-sdk/anthropic
```
```typescript
// src/ai/index.ts
import { anthropic } from '@ai-sdk/anthropic';
export const DEFAULT_MODEL = anthropic('claude-3-5-haiku-20241022');
```

### To Gemini 2.0 Flash:
```bash
npm install @ai-sdk/google
```
```typescript
// src/ai/index.ts
import { google } from '@ai-sdk/google';
export const DEFAULT_MODEL = google('gemini-2.0-flash-exp');
export const DEFAULT_EMBEDDING_MODEL = google.textEmbeddingModel('text-embedding-004');
export const DEFAULT_EMBEDDING_DIMENSIONS = 768; // Changed from 1536
```
**Note:** Changing embedding dimensions requires database schema updates and regenerating existing embeddings. See implementation guide for details.

---

## Full Documentation

- **🔵 OpenAI Only:** See `AI_MODEL_OPENAI_OPTIONS.md` for OpenAI-specific recommendations
- **🌍 All Providers:** See `AI_MODEL_OPTIONS.md` for all alternatives with pros/cons
- **Implementation:** See `AI_MODEL_IMPLEMENTATION_GUIDE.md` for step-by-step instructions
- **Testing:** Docs include testing strategies and troubleshooting

---

## Need to Decide?

### Staying with OpenAI
**Better quality?** → GPT-4o (17x cost, excellent creative writing)  
**Balanced upgrade?** → Hybrid approach (4x cost, 60% quality boost)  
**Better search?** → text-embedding-3-large (minimal cost increase)  
**Happy with current?** → Keep GPT-4o-mini (already excellent)

### Exploring Other Providers
**Best creative writing?** → Claude 3.5 Haiku (6x cost, superior prose)  
**Save money?** → Gemini 2.0 Flash (50% cost, 1M context window)  
**Absolute best?** → Claude 3.5 Sonnet (23x cost, premium quality)

---

**Recommendation:** If staying with OpenAI, try the **hybrid approach** (GPT-4o for articles, mini for everything else) for balanced quality improvement. See `AI_MODEL_OPENAI_OPTIONS.md` for full details. 🚀
