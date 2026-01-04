<script lang="ts">
	import Icon from './Icon.svelte';
	
	export let label: string;
	export let value: string;
	export let icon: string = '';
	export let color: string = 'var(--color-primary)';
	export let subtitle: string = '';
</script>

<div class="stat-card">
	<div class="flex items-start justify-between mb-2">
		<span class="text-sm text-gray-500 font-medium">{label}</span>
		{#if icon}
			<div 
				class="w-8 h-8 rounded-lg flex items-center justify-center"
				style="background-color: {color}10; color: {color}"
			>
				<Icon name={icon} size={16} />
			</div>
		{/if}
	</div>
	
	<div class="font-display text-3xl text-gray-900 mb-1" style="color: {color}">
		{value}
	</div>
	
	{#if subtitle}
		<p class="text-xs text-gray-400">{subtitle}</p>
	{/if}
</div>
