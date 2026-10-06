# Article model comparison

## Decision

Use `zai/glm-5.3-flash` for articles. Keep `openai/gpt-5-nano` for universe names, moderation decisions, and article titles.

GLM produced a readable, well-structured encyclopedia article with distinctive invented details and correct wiki-link syntax. It preserved the supplied dates, Sera Venn's role, the seven-signature rule, the open-air archive, and the preservation of both disputed maps. Its prose was competitive with the existing model for this task, while costing substantially less and starting to stream sooner.

This is a small qualitative comparison of one article per model, not proof of equivalent quality across every universe. GLM has a minor timing ambiguity: it places translation into finished charts after the eclipse, but says countersignatures traditionally coincide with the return of moonlight. Its opening also describes the census as the only occasion for boundary negotiations, a stronger restriction than the supplied lore. These are reasons to watch continuity in future articles, not enough to reject it here.

## Method

On 2026-10-06, all three models received the identical [prompt](prompt.md), extracted directly from `weaveWikiArticle` at commit `9a3449da934a48180580af54885e88662a4eb39e`. A synthetic universe and two reference articles exercise continuity without creating comparison content in the production database.

Calls used the repository's AI SDK 7.0.44 and Vercel AI Gateway with `streamText({ model, prompt })`. Temperature, reasoning effort, output length, and provider routing were left at defaults, matching the application. The harness added a four-minute cancellation deadline and disabled retries; every call completed normally on its first provider attempt. Candidate model IDs were verified using `gateway.getAvailableModels()`.

Costs below are Gateway-reported actual generation costs in USD, including reasoning tokens. All input tokens were uncached. Token counts vary by tokenizer. Word counts use whitespace splitting, and link counts include repeated links.

| Model | Words | Wiki links | First text | Completion | Reasoning tokens | Total output tokens | Actual cost |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| [GLM 5.3 Flash](glm-5.3-flash.md) | 682 | 15 | 1.50 s | 6.47 s | 94 | 978 | $0.0005730 |
| [DeepSeek V4.1 Flash](deepseek-v4.1-flash.md) | 716 | 24 | 17.21 s | 20.07 s | 4,127 | 5,065 | $0.0062511 |
| [GPT-5 mini](gpt-5-mini.md) | 972 | 27 | 13.43 s | 22.85 s | 1,344 | 2,652 | $0.0054415 |

GLM cost 89.5% less than GPT-5 mini in this sample and finished 3.5 times faster. DeepSeek cost 14.9% more than GPT-5 mini with default reasoning, despite cheaper output token rates. These measured savings are specific to these outputs, not a forecast for all traffic.

## Qualitative findings

- **GLM:** Strong organization with proper Markdown headings, clear exposition, and memorable additions such as the provisional boundary and the critics' archive marginalia. All explicit reference dates and principal continuity constraints were retained. The timing and negotiation ambiguities noted above remain small weaknesses.
- **DeepSeek:** Clear, organized, and faithful to the established lore. Some repetition, especially around the archive and underground storage. Its default reasoning added cost and delayed the first text without an obvious improvement in the final prose.
- **GPT-5 mini:** The fullest procedural and political account, with useful elaboration of the paired-knot method. Preserved the supplied continuity constraints. It used plain section labels rather than Markdown headings and repeated the same linked entities frequently; the ending restates earlier points.

All three printed the exact requested title, exceeded 500 words, stayed in universe, used between 5 and 30 wiki-link occurrences, and finished with `stop`. No raw reasoning was emitted as article text. Full generated articles are retained unchanged for auditability.

The available-model catalog reported standard per-million-token input/output rates of $0.15/$0.50 for GLM, $0.30/$1.20 for DeepSeek, and $0.25/$2.00 for GPT-5 mini. These matched the actual costs. Promotional lowest-provider prices displayed on public model pages were not used for the savings calculation.
