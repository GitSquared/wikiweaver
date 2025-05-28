import { describe, expect, test } from 'vitest';
import { slugify, unslugify } from './slugify';

describe('slugify', () => {
	test('should generate clean slugs', () => {
		expect(slugify('Hello World!')).toBe('hello_world');
	});
	test('should handle special characters', () => {
		expect(slugify('Hello, World!')).toBe('hello_world');
	});
	test('should handle multiple spaces', () => {
		expect(slugify('Hello    World')).toBe('hello_world');
	});
	test('should handle leading and trailing spaces', () => {
		expect(slugify('  Hello World  ')).toBe('hello_world');
	});
});

describe('unslugify', () => {
	test('should convert slugs back to readable text', () => {
		expect(unslugify('hello_world')).toBe('Hello World');
	});

	test('should handle multiple underscores', () => {
		expect(unslugify('hello__world')).toBe('Hello World');
	});

	test('should handle leading and trailing underscores', () => {
		expect(unslugify('_hello_world_')).toBe('Hello World');
	});
});
