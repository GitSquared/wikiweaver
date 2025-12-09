# AI Model Quick Reference

## Current Configuration

**Model:** OpenAI GPT-4o-mini  
**Location:** `src/ai/index.ts`  
**Cost per 1K articles:** ~$0.83  
**Speed:** Very fast ⚡  
**Quality:** Good balance ✅

---

## Top Recommendations

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

- **Detailed Options:** See `AI_MODEL_OPTIONS.md` for all alternatives with pros/cons
- **Implementation:** See `AI_MODEL_IMPLEMENTATION_GUIDE.md` for step-by-step instructions
- **Testing:** Both docs include testing strategies and troubleshooting

---

## Need to Decide?

**Just want better quality?** → Claude 3.5 Haiku (best creative writing)  
**Want to save money?** → Gemini 2.0 Flash (half the cost)  
**Want the absolute best?** → Claude 3.5 Sonnet (premium quality)  
**Happy with current?** → Keep GPT-4o-mini (solid choice)

**My recommendation:** Try **Gemini 2.0 Flash** first. It's cheaper and the massive context window could really help with article coherence across your universes! 🌌
