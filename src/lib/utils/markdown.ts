import { marked } from 'marked';

// Configure marked options
marked.setOptions({
	gfm: true,
	breaks: true,
});

/**
 * Parse markdown string to HTML
 */
export function parseMarkdown(markdown: string): string {
	if (!markdown) return '';
	return marked.parse(markdown) as string;
}

/**
 * Parse markdown with frontmatter (YAML header)
 * Returns { frontmatter: object, content: string (HTML) }
 */
export function parseMarkdownWithFrontmatter<T = Record<string, unknown>>(
	markdown: string
): { frontmatter: T; content: string } {
	if (!markdown) {
		return { frontmatter: {} as T, content: '' };
	}

	// Check for frontmatter (starts with ---)
	const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
	const match = markdown.match(frontmatterRegex);

	if (match) {
		const [, frontmatterStr, contentStr] = match;
		
		// Simple YAML parsing for basic key-value pairs
		const frontmatter: Record<string, unknown> = {};
		const lines = frontmatterStr.split('\n');
		
		for (const line of lines) {
			const colonIndex = line.indexOf(':');
			if (colonIndex > 0) {
				const key = line.slice(0, colonIndex).trim();
				let value: unknown = line.slice(colonIndex + 1).trim();
				
				// Remove quotes if present
				if ((value as string).startsWith('"') && (value as string).endsWith('"')) {
					value = (value as string).slice(1, -1);
				} else if ((value as string).startsWith("'") && (value as string).endsWith("'")) {
					value = (value as string).slice(1, -1);
				}
				// Parse booleans
				else if (value === 'true') value = true;
				else if (value === 'false') value = false;
				// Parse numbers
				else if (!isNaN(Number(value)) && value !== '') {
					value = Number(value);
				}
				
				frontmatter[key] = value;
			}
		}
		
		return {
			frontmatter: frontmatter as T,
			content: marked.parse(contentStr) as string,
		};
	}

	// No frontmatter found
	return {
		frontmatter: {} as T,
		content: marked.parse(markdown) as string,
	};
}

/**
 * Extract plain text from markdown (strips HTML)
 */
export function markdownToPlainText(markdown: string): string {
	const html = parseMarkdown(markdown);
	const temp = document.createElement('div');
	temp.innerHTML = html;
	return temp.textContent || temp.innerText || '';
}

/**
 * Get first paragraph from markdown as excerpt
 */
export function getExcerpt(markdown: string, maxLength = 160): string {
	// Remove frontmatter if present
	const contentMatch = markdown.match(/^---\s*\n[\s\S]*?\n---\s*\n([\s\S]*)$/);
	const content = contentMatch ? contentMatch[1] : markdown;
	
	// Get first paragraph
	const firstParagraph = content.split(/\n\n/)[0] || '';
	
	// Strip markdown formatting
	const plainText = firstParagraph
		.replace(/\*\*(.+?)\*\*/g, '$1') // Bold
		.replace(/\*(.+?)\*/g, '$1') // Italic
		.replace(/\[(.+?)\]\(.+?\)/g, '$1') // Links
		.replace(/#{1,6}\s+/g, '') // Headers
		.replace(/`(.+?)`/g, '$1') // Inline code
		.trim();
	
	if (plainText.length <= maxLength) return plainText;
	return plainText.slice(0, maxLength).trim() + '...';
}
