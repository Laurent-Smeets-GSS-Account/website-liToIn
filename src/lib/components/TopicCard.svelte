<script lang="ts">
	import { base } from '$app/paths';
	import Icon from './Icon.svelte';
	
	export let id: string;
	export let title: string;
	export let icon: string;
	export let color: string;
	export let items: string[] = [];
	export let link: string;
	export let description = '';
</script>

<a 
	href="{base}{link}" 
	class="topic-card group block"
	style="--card-color: {color}"
>
	<!-- Color Bar (via CSS ::before) -->
	
	<!-- Icon -->
	<div 
		class="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
		style="background-color: {color}15; color: {color}"
	>
		<Icon name={icon} size={24} />
	</div>
	
	<!-- Title -->
	<h3 class="font-display text-xl text-gray-900 mb-2 group-hover:text-primary transition-colors">
		{title}
	</h3>
	
	<!-- Description or Items -->
	{#if description}
		<p class="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
	{/if}
	
	{#if items.length > 0}
		<ul class="space-y-1.5 mb-4">
			{#each items.slice(0, 4) as item}
				<li class="flex items-start gap-2 text-sm text-gray-600">
					<span class="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style="background-color: {color}"></span>
					<span>{item}</span>
				</li>
			{/each}
			{#if items.length > 4}
				<li class="text-sm text-gray-400 pl-3.5">+{items.length - 4} more</li>
			{/if}
		</ul>
	{/if}
	
	<!-- Link indicator -->
	<div class="flex items-center gap-1 text-sm font-medium transition-colors" style="color: {color}">
		<span>Explore</span>
		<Icon name="arrow-right" size={16} className="transition-transform group-hover:translate-x-1" />
	</div>
</a>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
