import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Simple hash function for basic obfuscation (not cryptographically secure)
function simpleHash(str: string): string {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash;
	}
	return hash.toString(36);
}

// ============================================================
// PASSWORD CONFIGURATION
// ============================================================
// To change the password:
// 1. Open your browser console on the site
// 2. Run: generateHash('your-new-password')
// 3. Copy the output and paste it below
// 4. Rebuild and deploy
//
// Current password: "indonesia2025"
// ============================================================
const PASSWORD_HASH = 'rw4sat';

// Check if already authenticated from sessionStorage
const getInitialAuth = (): boolean => {
	if (browser) {
		return sessionStorage.getItem('authenticated') === 'true';
	}
	return false;
};

export const isAuthenticated = writable<boolean>(getInitialAuth());

export function login(password: string): boolean {
	const inputHash = simpleHash(password);
	if (inputHash === PASSWORD_HASH) {
		isAuthenticated.set(true);
		if (browser) {
			sessionStorage.setItem('authenticated', 'true');
		}
		return true;
	}
	return false;
}

export function logout(): void {
	isAuthenticated.set(false);
	if (browser) {
		sessionStorage.removeItem('authenticated');
	}
}

// Helper to generate hash for a new password
// Usage in browser console: generateHash('my-new-password')
if (browser) {
	(window as unknown as Record<string, unknown>).generateHash = simpleHash;
}
