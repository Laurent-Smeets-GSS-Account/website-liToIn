import Papa from 'papaparse';
import { base } from '$app/paths';

/**
 * Load and parse a CSV file from the static/data directory
 */
export async function loadCSV<T = Record<string, unknown>>(filename: string): Promise<T[]> {
	try {
		const response = await fetch(`${base}/data/${filename}`);
		if (!response.ok) {
			console.error(`Failed to load CSV: ${filename}`);
			return [];
		}
		const csvText = await response.text();
		
		const result = Papa.parse<T>(csvText, {
			header: true,
			dynamicTyping: true,
			skipEmptyLines: true,
			transformHeader: (header: string) => header.trim(),
		});
		
		if (result.errors.length > 0) {
			console.warn(`CSV parse warnings for ${filename}:`, result.errors);
		}
		
		return result.data;
	} catch (error) {
		console.error(`Error loading CSV ${filename}:`, error);
		return [];
	}
}

/**
 * Load JSON content from the static/content directory
 */
export async function loadContent<T = Record<string, unknown>>(path: string): Promise<T> {
	try {
		const response = await fetch(`${base}/content/${path}`);
		if (!response.ok) {
			console.error(`Failed to load content: ${path}`);
			return {} as T;
		}
		return await response.json();
	} catch (error) {
		console.error(`Error loading content ${path}:`, error);
		return {} as T;
	}
}

/**
 * Load markdown content from the static/content directory
 */
export async function loadMarkdown(path: string): Promise<string> {
	try {
		const response = await fetch(`${base}/content/${path}`);
		if (!response.ok) {
			console.error(`Failed to load markdown: ${path}`);
			return '';
		}
		return await response.text();
	} catch (error) {
		console.error(`Error loading markdown ${path}:`, error);
		return '';
	}
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(num: number | string, decimals = 0): string {
	const n = typeof num === 'string' ? parseFloat(num) : num;
	if (isNaN(n)) return '—';
	return n.toLocaleString('en-US', {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	});
}

/**
 * Format a number as a percentage
 */
export function formatPercent(num: number | string, decimals = 1): string {
	const n = typeof num === 'string' ? parseFloat(num) : num;
	if (isNaN(n)) return '—';
	// If the number is already in percentage form (e.g., 45.5 for 45.5%)
	if (Math.abs(n) > 1) {
		return `${n.toFixed(decimals)}%`;
	}
	// If the number is in decimal form (e.g., 0.455 for 45.5%)
	return `${(n * 100).toFixed(decimals)}%`;
}

/**
 * Format a date string
 */
export function formatDate(dateStr: string, format: 'short' | 'long' = 'short'): string {
	try {
		const date = new Date(dateStr);
		if (format === 'long') {
			return date.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			});
		}
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
		});
	} catch {
		return dateStr;
	}
}

/**
 * Convert data array to CSV string for download
 */
export function arrayToCSV(data: Record<string, unknown>[]): string {
	if (data.length === 0) return '';
	
	const headers = Object.keys(data[0]);
	const csvRows = [
		headers.join(','),
		...data.map(row =>
			headers.map(header => {
				const value = row[header];
				// Escape quotes and wrap in quotes if contains comma
				const stringValue = String(value ?? '');
				if (stringValue.includes(',') || stringValue.includes('"')) {
					return `"${stringValue.replace(/"/g, '""')}"`;
				}
				return stringValue;
			}).join(',')
		),
	];
	
	return csvRows.join('\n');
}

/**
 * Trigger a file download
 */
export function downloadFile(content: string | Blob, filename: string, mimeType = 'text/csv'): void {
	const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

/**
 * Load chart content from a markdown file
 * 
 * Format: Sections separated by --- with ## headings as card IDs
 * 
 * Example:
 * ---
 * ## card-id
 * 
 * Content for this card with **markdown** support.
 * 
 * ---
 * ## another-card
 * 
 * More content here.
 */
export async function loadChartContent(pageName: string): Promise<Record<string, string>> {
	try {
		const response = await fetch(`${base}/content/charts/${pageName}.md`);
		if (!response.ok) return {};
		
		const text = await response.text();
		const sections: Record<string, string> = {};
		
		// Split by horizontal rules (---)
		const parts = text.split(/\n---\n/);
		
		for (const part of parts) {
			// Look for ## heading at start of section
			const match = part.match(/^##\s+(\S+)\s*\n([\s\S]*)/m);
			if (match) {
				const id = match[1].trim().toLowerCase();
				const content = match[2].trim();
				sections[id] = content;
			}
		}
		
		return sections;
	} catch (e) {
		console.warn(`Failed to load chart content for ${pageName}:`, e);
		return {};
	}
}
