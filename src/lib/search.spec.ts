import { describe, expect, test } from 'vitest';
import { TEST_cutParagraphsForIndexing } from './search';

const TEST_ARTICLE_TEXT = `
# The Great Data Harvest Of 2145

**The Great Data Harvest of 2145** was a pivotal event in the history of the [[Sylvan Data Consortium]], marking a significant advancement in the methods of data collection and storage within the realm. This event not only transformed the landscape of data management but also had _profound_ implications for the socio-economic structure of the [[Verdant Territories]].

- and here's bullet point 1
- in a [very nice](https://example.com), and packed with a lot of information,
- list of _things_.

## Background

In the early 22nd century, the reliance on organic data storage systems, particularly the [[Datawood Trees]], became increasingly prevalent. These trees, genetically engineered to store vast amounts of information within their bark and leaves, were cultivated in specialized groves known as [[Data Orchards]].

By 2145, the demand for data storage had surged due to the rapid expansion of digital communication and the proliferation of [[Cortex Networks]], which connected various regions through a web of information.

`;

const TEST_ARTICLE_TEXT_PARAGRAPH_CLEAN_1 =
	'The Great Data Harvest of 2145 was a pivotal event in the history of the Sylvan Data Consortium, marking a significant advancement in the methods of data collection and storage within the realm. This event not only transformed the landscape of data management but also had profound implications for the socio-economic structure of the Verdant Territories.';

const TEST_ARTICLE_TEXT_PARAGRAPH_CLEAN_2 = `and here's bullet point 1
in a very nice, and packed with a lot of information,
list of things.`;

describe('cutParagraphsForIndexing', () => {
	test('should split text into paragraphs', () => {
		const paragraphs = TEST_cutParagraphsForIndexing(TEST_ARTICLE_TEXT);
		expect(paragraphs.length).toBeGreaterThan(2);
	});

	test('should filter out short paragraphs', () => {
		const paragraphs = TEST_cutParagraphsForIndexing(TEST_ARTICLE_TEXT);
		expect(paragraphs.every((p) => p.length > 70)).toBe(true);
	});

	test('should remove markdown formatting and trim whitespace', () => {
		const paragraphs = TEST_cutParagraphsForIndexing(TEST_ARTICLE_TEXT);
		expect(paragraphs[0]).toBe(TEST_ARTICLE_TEXT_PARAGRAPH_CLEAN_1);
		expect(paragraphs[1]).toBe(TEST_ARTICLE_TEXT_PARAGRAPH_CLEAN_2);
	});
});
