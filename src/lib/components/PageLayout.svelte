<script lang="ts">
	import { base } from '$app/paths';
	import Icon from './Icon.svelte';
	
	export let title: string;
	export let subtitle: string = '';
	export let color: string = 'var(--color-primary)';
	export let showBreadcrumb: boolean = true;
</script>

<div class="min-h-screen">
	<!-- Page Header -->
	<div class="bg-white border-b border-gray-100">
		<div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
			{#if showBreadcrumb}
				<nav class="flex items-center gap-2 text-sm text-gray-500 mb-4">
					<a href="{base}/" class="hover:text-gray-900 transition-colors">Home</a>
					<Icon name="chevron-right" size={14} />
					<span class="text-gray-900">{title}</span>
				</nav>
			{/if}
			
			<div class="flex items-center gap-4">
				<div 
					class="w-1 h-12 rounded-full"
					style="background-color: {color}"
				></div>
				<div>
					<h1 class="font-display text-3xl sm:text-4xl text-gray-900">{title}</h1>
					{#if subtitle}
						<p class="text-gray-600 mt-1">{subtitle}</p>
					{/if}
				</div>
			</div>
		</div>
	</div>
	
	<!-- Page Content -->
	<div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
		<slot />
	</div>
</div>
