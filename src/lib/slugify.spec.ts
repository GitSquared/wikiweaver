import { describe, expect, test } from 'vitest';
import { slugify, unslugify } from './slugify';

describe('slugify', () => {
	test('should generate clean slugs', () => {
		expect(slugify('Hello World!')).toBe('hello-world');
	});
	test('should handle special characters', () => {
		expect(slugify('Hello, World!')).toBe('hello-world');
	});
	test('should handle multiple spaces', () => {
		expect(slugify('Hello    World')).toBe('hello-world');
	});
	test('should handle leading and trailing spaces', () => {
		expect(slugify('  Hello World  ')).toBe('hello-world');
	});
	test('preserves non-Latin names', () => {
		expect(slugify('무인궤도의 연대')).toBe('무인궤도의-연대');
	});
	test('normalizes and preserves accented names', () => {
		expect(slugify('Échos ＆ Rêves')).toBe('échos-rêves');
	});
	test('returns an empty slug when a name contains no letters or numbers', () => {
		expect(slugify('✨ — !!!')).toBe('');
	});
	test('limits slugs without splitting Unicode characters', () => {
		const slug = slugify('界'.repeat(300));
		expect(Array.from(slug)).toHaveLength(255);
		expect(slug).toBe('界'.repeat(255));
	});
});

describe('unslugify', () => {
	test('should convert slugs back to readable text', () => {
		expect(unslugify('hello-world')).toBe('Hello World');
	});

	test('should handle multiple underscores', () => {
		expect(unslugify('hello--world')).toBe('Hello World');
	});

	test('should handle leading and trailing underscores', () => {
		expect(unslugify('-hello-world-')).toBe('Hello World');
	});
});
