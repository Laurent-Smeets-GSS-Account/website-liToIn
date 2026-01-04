import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		include: ['d3-scale', 'd3-shape', 'papaparse', 'marked', 'html-to-image']
	}
});
