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
		title: 'Services and Amenities',
		subtitle: 'Monitor access to essential services and infrastructure',
		color: '#059669'
	};
	
	onMount(async () => {
		const markdown = await loadMarkdown('pages/services-access.md');
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
		<MarkdownContent src="pages/services-access.md" />
	</div>
</PageLayout>
