<script lang="ts">
	import { onMount } from 'svelte';
	import { PageLayout, MarkdownContent } from '$lib/components';
	import { parseMarkdownWithFrontmatter, loadMarkdown } from '$lib/utils';
	
	interface PageFrontmatter {
		title: string;
		subtitle: string;
		color: string;
	}
	
	let frontmatter: PageFrontmatter = {
		title: 'Explore Other Indicators',
		subtitle: 'Additional data and cross-cutting themes',
		color: '#6B7280'
	};
	
	onMount(async () => {
		const markdown = await loadMarkdown('pages/other-indicators.md');
		const parsed = parseMarkdownWithFrontmatter<PageFrontmatter>(markdown);
		if (parsed.frontmatter.title) {
			frontmatter = { ...frontmatter, ...parsed.frontmatter };
		}
	});
</script>

<svelte:head>
	<title>{frontmatter.title} | Listening to Indonesia</title>
</svelte:head>

<PageLayout 
	title={frontmatter.title}
	subtitle={frontmatter.subtitle}
	color={frontmatter.color}
>
	<div class="bg-white rounded-2xl p-8 shadow-card">
		<MarkdownContent src="pages/other-indicators.md" />
	</div>
</PageLayout>
