<script lang="ts">
	import { onMount } from 'svelte';
	import { Header, Footer } from '$lib/components';
	import { loadContent } from '$lib/utils';
	import { isAuthenticated } from '$lib/stores/auth';
	import LoginScreen from '$lib/components/LoginScreen.svelte';
	import '../app.css';
	
	interface SiteConfig {
		title: string;
		logo: string;
		navigation: Array<{ label: string; href: string }>;
		colors: Record<string, string>;
		footer: {
			organizationName: string;
			disclaimer: string;
			license: string;
		};
	}
	
	let siteConfig: SiteConfig | null = null;
	
	onMount(async () => {
		siteConfig = await loadContent<SiteConfig>('site.json');
		
		// Apply colors as CSS custom properties
		if (siteConfig?.colors) {
			const root = document.documentElement;
			for (const [key, value] of Object.entries(siteConfig.colors)) {
				root.style.setProperty(`--color-${key}`, value);
			}
		}
	});
</script>

{#if !$isAuthenticated}
	<LoginScreen />
{:else}
	<div class="min-h-screen flex flex-col bg-background">
		{#if siteConfig}
			<Header 
				title={siteConfig.title}
				logoSrc={siteConfig.logo}
				navLinks={siteConfig.navigation}
			/>
			
			<main class="flex-1">
				<slot />
			</main>
			
			<Footer 
				organizationName={siteConfig.footer.organizationName}
				disclaimer={siteConfig.footer.disclaimer}
				license={siteConfig.footer.license}
			/>
		{:else}
			<!-- Loading state -->
			<div class="flex-1 flex items-center justify-center">
				<div class="animate-pulse text-gray-400">Loading...</div>
			</div>
		{/if}
	</div>
{/if}
