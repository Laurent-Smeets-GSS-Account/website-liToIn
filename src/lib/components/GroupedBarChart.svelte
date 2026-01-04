<script lang="ts">
	import { onMount } from 'svelte';
	import ChartWrapper from './ChartWrapper.svelte';
	import theme from '$lib/theme';
	
	interface GroupedBarData {
		group: string;
		values: { label: string; value: number }[];
	}
	
	export let data: GroupedBarData[] = [];
	export let title: string = '';
	export let chartId: string = 'grouped-bar';
	export let height: number = 300;
	export let yLabel: string = '';
	export let colors: string[] = theme.colors.chart.slice(0, 3);
	export let legendLabels: string[] = [];
	
	let containerWidth = 600;
	let container: HTMLDivElement;
	
	const MARGIN = { top: 30, right: 30, bottom: 70, left: 60 };
	
	$: innerWidth = containerWidth - MARGIN.left - MARGIN.right;
	$: innerHeight = height - MARGIN.top - MARGIN.bottom;
	
	// Get all unique value labels (for legend)
	$: valueLabels = data.length > 0 ? data[0].values.map(v => v.label) : [];
	
	// Calculate scales
	$: groupWidth = innerWidth / Math.max(1, data.length);
	$: barWidth = Math.min(40, (groupWidth - 20) / Math.max(1, valueLabels.length));
	
	$: yMax = Math.max(15, Math.ceil(Math.max(...data.flatMap(g => g.values.map(v => v.value))) * 1.15));
	$: yScale = (value: number) => MARGIN.top + innerHeight - (value / yMax) * innerHeight;
	
	// Y-axis ticks
	$: yTicks = Array.from({ length: 5 }, (_, i) => (yMax / 4) * i);
	
	let hoveredBar: { group: string; label: string; value: number } | null = null;
	
	// Convert data to flat array for CSV export
	$: flatData = data.flatMap(g => 
		g.values.map(v => ({ group: g.group, category: v.label, value: v.value }))
	);
	
	// Resize observer
	onMount(() => {
		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				containerWidth = entry.contentRect.width;
			}
		});
		
		if (container) {
			resizeObserver.observe(container);
			containerWidth = container.clientWidth;
		}
		
		return () => resizeObserver.disconnect();
	});
</script>

<ChartWrapper 
	{title} 
	{chartId} 
	data={flatData}
	columns={['group', 'category', 'value']}
	columnLabels={{ group: 'Group', category: 'Category', value: 'Value' }}
	formatters={{ value: (v) => typeof v === 'number' ? `${v.toFixed(1)}%` : String(v) }}
>
	<!-- Legend -->
	<div class="legend">
		{#each valueLabels as label, i}
			<div class="legend-item">
				<span class="legend-color" style="background-color: {colors[i % colors.length]}"></span>
				<span class="legend-label">{legendLabels[i] || label}</span>
			</div>
		{/each}
	</div>
	
	<!-- Chart -->
	<div bind:this={container} class="chart-area">
		<svg width={containerWidth} {height}>
			<!-- Y-axis grid and labels -->
			{#each yTicks as tick}
				<line
					x1={MARGIN.left}
					x2={containerWidth - MARGIN.right}
					y1={yScale(tick)}
					y2={yScale(tick)}
					stroke="#f3f4f6"
					stroke-width="1"
				/>
				<text
					x={MARGIN.left - 10}
					y={yScale(tick)}
					text-anchor="end"
					dominant-baseline="middle"
					class="axis-label"
				>
					{tick.toFixed(0)}%
				</text>
			{/each}
			
			<!-- Y-axis label -->
			{#if yLabel}
				<text
					x={15}
					y={MARGIN.top + innerHeight / 2}
					text-anchor="middle"
					transform="rotate(-90, 15, {MARGIN.top + innerHeight / 2})"
					class="axis-title"
				>
					{yLabel}
				</text>
			{/if}
			
			<!-- Bars -->
			{#each data as group, groupIndex}
				{@const groupX = MARGIN.left + groupIndex * groupWidth + (groupWidth - barWidth * valueLabels.length) / 2}
				
				{#each group.values as bar, barIndex}
					{@const barX = groupX + barIndex * barWidth}
					{@const barH = Math.max(0, (bar.value / yMax) * innerHeight)}
					{@const isHovered = hoveredBar?.group === group.group && hoveredBar?.label === bar.label}
					
					<rect
						x={barX}
						y={yScale(bar.value)}
						width={barWidth - 4}
						height={barH}
						fill={colors[barIndex % colors.length]}
						fill-opacity={isHovered ? 0.95 : 0.8}
						rx="3"
						on:mouseenter={() => hoveredBar = { group: group.group, label: bar.label, value: bar.value }}
						on:mouseleave={() => hoveredBar = null}
						class="bar"
					/>
					
					<!-- Value label on hover -->
					{#if isHovered}
						<text
							x={barX + (barWidth - 4) / 2}
							y={yScale(bar.value) - 8}
							text-anchor="middle"
							class="value-label"
						>
							{bar.value.toFixed(1)}%
						</text>
					{/if}
				{/each}
				
				<!-- Group label -->
				<text
					x={MARGIN.left + groupIndex * groupWidth + groupWidth / 2}
					y={height - MARGIN.bottom + 25}
					text-anchor="middle"
					class="group-label"
				>
					{#each group.group.split('\n') as line, lineIndex}
						<tspan 
							x={MARGIN.left + groupIndex * groupWidth + groupWidth / 2}
							dy={lineIndex === 0 ? 0 : 14}
						>
							{line}
						</tspan>
					{/each}
				</text>
			{/each}
			
			<!-- X-axis line -->
			<line
				x1={MARGIN.left}
				x2={containerWidth - MARGIN.right}
				y1={MARGIN.top + innerHeight}
				y2={MARGIN.top + innerHeight}
				stroke="#e5e7eb"
				stroke-width="1"
			/>
		</svg>
	</div>
</ChartWrapper>

<style>
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		margin-bottom: 1rem;
	}
	
	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: #4b5563;
	}
	
	.legend-color {
		width: 1rem;
		height: 0.75rem;
		border-radius: 2px;
	}
	
	.chart-area {
		overflow-x: auto;
	}
	
	.bar {
		cursor: pointer;
		transition: fill-opacity 0.15s ease;
	}
	
	.axis-label {
		font-size: 0.75rem;
		fill: #9ca3af;
	}
	
	.axis-title {
		font-size: 0.8125rem;
		fill: #6b7280;
		font-weight: 500;
	}
	
	.group-label {
		font-size: 0.75rem;
		fill: #4b5563;
	}
	
	.value-label {
		font-size: 0.75rem;
		font-weight: 600;
		fill: #111827;
	}
</style>
