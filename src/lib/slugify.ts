const MAX_SLUG_LENGTH = 255;

export function slugify(text: string): string {
	const slug = text
		.normalize('NFKC')
		.toLowerCase()
		.replace(/[^\p{Letter}\p{Mark}\p{Number}]+/gu, '-')
		.replace(/^-+|-+$/g, '');

	return Array.from(slug)
		.slice(0, MAX_SLUG_LENGTH)
		.join('')
		.replace(/-+$/g, '');
}

export function unslugify(slug: string): string {
	return slug
		.replace(/-/g, ' ')
		.trim()
		.replace(/ +/g, ' ')
		.replace(/\b\w/g, (char) => char.toUpperCase());
}
