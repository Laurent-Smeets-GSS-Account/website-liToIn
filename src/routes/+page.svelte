<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { TopicCard, InteractiveChart, Icon } from '$lib/components';
	import { loadContent, loadCSV } from '$lib/utils';
	
	interface SiteConfig {
		title: string;
		subtitle: string;
		description: string;
		logo: string;
		latestChart: {
			title: string;
			dataFile: string;
			xKey: string;
			yKeys: string[];
			labels: Record<string, string>;
			xLabel: string;
			yLabel: string;
		};
		colors: Record<string, string>;
	}
	
	interface Topic {
		id: string;
		title: string;
		icon: string;
		color: string;
		link: string;
		description: string;
		items: string[];
	}
	
	let siteConfig: SiteConfig | null = null;
	let topics: Topic[] = [];
	let chartData: Record<string, unknown>[] = [];
	let latestValue: number | null = null;
	let previousValue: number | null = null;
	let changePercent: number | null = null;
	
	onMount(async () => {
		siteConfig = await loadContent<SiteConfig>('site.json');
		const topicsData = await loadContent<{ topics: Topic[] }>('topics.json');
		topics = topicsData.topics || [];
		
		if (siteConfig?.latestChart?.dataFile) {
			chartData = await loadCSV(siteConfig.latestChart.dataFile);
			
			if (chartData.length > 0) {
				const yKey = siteConfig.latestChart.yKeys[0];
				latestValue = Number(chartData[chartData.length - 1][yKey]);
				if (chartData.length > 1) {
					previousValue = Number(chartData[chartData.length - 2][yKey]);
					changePercent = ((latestValue - previousValue) / previousValue) * 100;
				}
			}
		}
	});
</script>

<svelte:head>
	<title>{siteConfig?.title || 'Listening to Indonesia'}</title>
	<meta name="description" content={siteConfig?.description || ''} />
</svelte:head>

<!-- Hero Section -->
<section class="bg-white border-b border-gray-200">
	<div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
		<div class="flex flex-col md:flex-row items-center gap-8 md:gap-12">
			{#if siteConfig?.logo}
				<div class="flex-shrink-0">
					<img 
						src="{base}/{siteConfig.logo}" 
						alt="Listening to Indonesia Logo" 
						class="h-32 sm:h-40 md:h-48 w-auto"
					/>
				</div>
			{/if}
			
			<div class="flex-1 text-center md:text-left">
				<h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3" style="color: #C41E3A;">
					LISTENING TO INDONESIA
				</h1>
				<p class="text-xl sm:text-2xl text-gray-800 font-medium mb-4">
					Real time insights of how Indonesians perceive their livelihood
				</p>
				<p class="text-gray-600 mb-6 max-w-2xl">
					A nationally representative monthly survey tracking household welfare, economic conditions, and public sentiments for better policy responses.
				</p>
				<div class="flex flex-wrap gap-4 justify-center md:justify-start">
					<a href="#explore" class="inline-flex items-center px-6 py-3 border-2 border-gray-800 text-gray-800 font-semibold rounded-lg hover:bg-gray-800 hover:text-white transition-colors">
						Explore latest results
					</a>
					<a href="{base}/methodology" class="inline-flex items-center px-6 py-3 border-2 border-gray-800 text-gray-800 font-semibold rounded-lg hover:bg-gray-800 hover:text-white transition-colors">
						Learn more...
					</a>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- At A Glance Section -->
<section class="py-8 bg-gray-50 border-b border-gray-200">
	<div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
		<h2 class="text-lg font-bold text-gray-900 mb-6 uppercase tracking-wide">At a Glance</h2>
		<div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
			<div class="flex items-center gap-4">
				<div class="text-gray-700">
					<Icon name="users" size={32} strokeWidth={1.5} />
				</div>
				<div>
					<div class="text-sm text-gray-600">~2000 households surveyed monthly</div>
				</div>
			</div>
			
			<div class="flex items-center gap-4">
				<div class="text-gray-700">
					<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
					</svg>
				</div>
				<div>
					<div class="text-sm text-gray-600">Nationally representative</div>
				</div>
			</div>
			
			<div class="flex items-center gap-4">
				<div class="text-gray-700">
					<Icon name="phone" size={32} strokeWidth={1.5} />
				</div>
				<div>
					<div class="text-sm text-gray-600">Phone based panel survey</div>
				</div>
			</div>
			
			<div class="flex items-center gap-4">
				<div class="text-gray-700">
					<Icon name="calendar" size={32} strokeWidth={1.5} />
				</div>
				<div>
					<div class="text-sm text-gray-600">Running since March 2024</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Dashboard Section -->
<section id="explore" class="py-8 sm:py-12">
	<div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
			{#if siteConfig?.latestChart && chartData.length > 0}
				<div class="lg:col-span-2">
					<InteractiveChart
						data={chartData}
						title={siteConfig.latestChart.title}
						xKey={siteConfig.latestChart.xKey}
						yKeys={siteConfig.latestChart.yKeys}
						labels={siteConfig.latestChart.labels}
						xLabel={siteConfig.latestChart.xLabel}
						yLabel={siteConfig.latestChart.yLabel}
						colors={[siteConfig.colors?.primary || '#C41E3A']}
						chartId="home-poverty-chart"
						yFormat={(v) => `${v.toFixed(1)}%`}
						height={350}
					/>
				</div>
			{/if}
			
			<div class="space-y-4">
				<div class="card p-6">
					<div class="text-sm font-medium text-gray-500 mb-1">Latest Reading</div>
					<div class="big-number mb-2">
						{latestValue !== null ? `${latestValue.toFixed(1)}%` : '—'}
					</div>
					{#if changePercent !== null}
						<div class="flex items-center gap-2">
							{#if changePercent < 0}
								<span class="flex items-center gap-1 text-green-600 text-sm font-medium">
									<Icon name="trending-down" size={16} />
									{Math.abs(changePercent).toFixed(1)}% decrease
								</span>
							{:else}
								<span class="flex items-center gap-1 text-red-600 text-sm font-medium">
									<Icon name="trending-up" size={16} />
									{changePercent.toFixed(1)}% increase
								</span>
							{/if}
							<span class="text-gray-400 text-sm">vs last month</span>
						</div>
					{/if}
				</div>
				
				<div class="card p-6">
					<h3 class="font-bold text-gray-900 mb-3">Quick Access</h3>
					<div class="space-y-2">
						<a href="{base}/economic-livelihood" class="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group">
							<span class="text-sm font-medium text-gray-700">Economic Data</span>
							<Icon name="chevron-right" size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
						</a>
						<a href="{base}/food-insecurity" class="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group">
							<span class="text-sm font-medium text-gray-700">Food Security</span>
							<Icon name="chevron-right" size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
						</a>
						<a href="{base}/vulnerability" class="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group">
							<span class="text-sm font-medium text-gray-700">Vulnerability</span>
							<Icon name="chevron-right" size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
						</a>
					</div>
				</div>
			</div>
		</div>
		
		<div>
			<div class="flex items-center justify-between mb-6">
				<div>
					<h2 class="text-2xl sm:text-3xl font-bold text-gray-900">Explore Topics</h2>
					<p class="text-gray-500 mt-1">Dive deeper into specific indicators and analysis</p>
				</div>
			</div>
			
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
				{#each topics as topic}
					<TopicCard
						id={topic.id}
						title={topic.title}
						icon={topic.icon}
						color={topic.color}
						link={topic.link}
						description={topic.description}
						items={topic.items}
					/>
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	.animate-fade-in {
		animation: fadeIn 0.5s ease-out forwards;
	}
	
	.animate-slide-up {
		opacity: 0;
		animation: slideUp 0.5s ease-out forwards;
	}
	
	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
	
	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
