<script lang="ts">
	import { onMount } from 'svelte';
	import { loadMarkdown, parseMarkdown } from '$lib/utils';
	
	export let content: string = '';
	export let src: string = '';
	
	let htmlContent = '';
	let loading = false;
	
	// If src is provided, load from file
	onMount(async () => {
		if (src) {
			loading = true;
			const markdown = await loadMarkdown(src);
			htmlContent = parseMarkdown(markdown);
			loading = false;
		}
	});
	
	// If content is provided directly, parse it
	$: if (content && !src) {
		htmlContent = parseMarkdown(content);
	}
</script>

{#if loading}
	<div class="animate-pulse">
		<div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
		<div class="h-4 bg-gray-200 rounded w-full mb-4"></div>
		<div class="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
	</div>
{:else}
	<div class="markdown-content">
		{@html htmlContent}
	</div>
{/if}
