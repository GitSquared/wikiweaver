export function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '_')
		.replace(/^_|_$/g, '')
		.slice(0, 255);
}

export function unslugify(slug: string): string {
	return slug
		.replace(/_/g, ' ')
		.trim()
		.replace(/ +/g, ' ')
		.replace(/\b\w/g, (char) => char.toUpperCase());
}
