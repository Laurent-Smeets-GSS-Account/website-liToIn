<script lang="ts">
	import { onMount } from 'svelte';
	import ChartWrapper from './ChartWrapper.svelte';
	import theme from '$lib/theme';
	
	interface BarData {
		label: string;
		value: number;
		significance?: string;
		pValue?: number;
		category?: string;
	}
	
	export let data: BarData[] = [];
	export let title: string = '';
	export let subtitle: string = '';
	export let chartId: string = 'hbar';
	export let xLabel: string = 'Regression Coefficient';
	export let positiveColor: string = theme.colors.positive;
	export let negativeColor: string = theme.colors.negative;
	export let noteText: string = 'Note: Only showing statistically significant results (p<0.05). Results from fixed effects household panel regressions.';
	export let showPValues: boolean = true;
	
	let containerWidth = 600;
	let container: HTMLDivElement;
	
	// Constants
	const BAR_HEIGHT = 26;
	const BAR_GAP = 5;
	const MARGIN = { top: 20, right: 60, bottom: 50, left: 280 };
	
	// Sorted data (by value, positive first then negative)
	$: sortedData = [...data].sort((a, b) => b.value - a.value);
	
	// Calculate max absolute value for color scaling
	$: maxAbsValue = Math.max(...sortedData.map(d => Math.abs(d.value)), 0.01);
	
	// Color scale function - darker = larger magnitude
	function getBarColor(value: number): string {
		const magnitude = Math.abs(value) / maxAbsValue; // 0 to 1
		if (value >= 0) {
			// Green gradient: lighter (low magnitude) to darker (high magnitude)
			const lightness = 75 - (magnitude * 35); // 75% to 40%
			return `hsl(152, 60%, ${lightness}%)`;
		} else {
			// Red gradient: lighter (low magnitude) to darker (high magnitude)
			const lightness = 70 - (magnitude * 30); // 70% to 40%
			return `hsl(0, 70%, ${lightness}%)`;
		}
	}
	
	// Dimensions
	$: chartHeight = sortedData.length * (BAR_HEIGHT + BAR_GAP) + MARGIN.top + MARGIN.bottom;
	$: innerWidth = containerWidth - MARGIN.left - MARGIN.right;
	$: innerHeight = chartHeight - MARGIN.top - MARGIN.bottom;
	
	// X scale
	$: xExtent = (() => {
		if (sortedData.length === 0) return [-0.1, 0.1];
		const values = sortedData.map(d => d.value);
		const min = Math.min(0, ...values);
		const max = Math.max(0, ...values);
		const padding = Math.max(0.02, (max - min) * 0.1);
		return [min - padding, max + padding];
	})();
	
	$: xScale = (value: number) => {
		const [min, max] = xExtent;
		return MARGIN.left + ((value - min) / (max - min)) * innerWidth;
	};
	
	$: zeroX = xScale(0);
	
	// X-axis ticks
	$: xTicks = (() => {
		const [min, max] = xExtent;
		const range = max - min;
		const step = range / 5;
		return Array.from({ length: 6 }, (_, i) => min + i * step);
	})();
	
	// Format p-value for display in label
	function formatPValueShort(p: number | undefined): string {
		if (p === undefined) return '';
		if (p < 0.001) return 'p<.001';
		if (p < 0.01) return `p=${p.toFixed(3).replace('0.', '.')}`;
		return `p=${p.toFixed(2).replace('0.', '.')}`;
	}
	
	// Format p-value for tooltip
	function formatPValueLong(p: number | undefined): string {
		if (p === undefined) return '';
		if (p < 0.001) return 'p < 0.001';
		return `p = ${p.toFixed(4)}`;
	}
	
	// Hover state
	let hoveredIndex: number | null = null;
	
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
	data={data} 
	subtitle={subtitle}
	columns={['label', 'value', 'pValue']}
	columnLabels={{ label: 'Variable', value: 'Coefficient', pValue: 'P-value' }}
	formatters={{ 
		value: (v) => typeof v === 'number' ? v.toFixed(4) : String(v),
		pValue: (v) => typeof v === 'number' ? (v < 0.001 ? '<0.001' : v.toFixed(4)) : ''
	}}
>
	<div bind:this={container} class="chart-area">
		<svg width={containerWidth} height={chartHeight}>
			<!-- Grid lines -->
			{#each xTicks as tick}
				<line
					x1={xScale(tick)}
					x2={xScale(tick)}
					y1={MARGIN.top}
					y2={MARGIN.top + innerHeight}
					stroke="#f3f4f6"
					stroke-width="1"
				/>
			{/each}
			
			<!-- Zero line (emphasized) -->
			<line
				x1={zeroX}
				x2={zeroX}
				y1={MARGIN.top}
				y2={MARGIN.top + innerHeight}
				stroke="#d1d5db"
				stroke-width="1.5"
			/>
			
			<!-- Bars -->
			{#each sortedData as item, i}
				{@const barY = MARGIN.top + i * (BAR_HEIGHT + BAR_GAP)}
				{@const barWidth = Math.abs(xScale(item.value) - zeroX)}
				{@const barX = item.value >= 0 ? zeroX : xScale(item.value)}
				{@const isHovered = hoveredIndex === i}
				{@const barColor = getBarColor(item.value)}
				
				<!-- Bar -->
				<rect
					x={barX}
					y={barY}
					width={barWidth}
					height={BAR_HEIGHT}
					fill={barColor}
					fill-opacity={isHovered ? 1 : 0.85}
					rx="3"
					on:mouseenter={() => hoveredIndex = i}
					on:mouseleave={() => hoveredIndex = null}
					class="bar"
				/>
				
				<!-- Label only -->
				<text
					x={MARGIN.left - 8}
					y={barY + BAR_HEIGHT / 2}
					text-anchor="end"
					dominant-baseline="middle"
					class="bar-label"
				>
					{item.label}
				</text>
			{/each}
			
			<!-- X-axis -->
			<line
				x1={MARGIN.left}
				x2={MARGIN.left + innerWidth}
				y1={MARGIN.top + innerHeight}
				y2={MARGIN.top + innerHeight}
				stroke="#e5e7eb"
				stroke-width="1"
			/>
			
			<!-- X-axis labels -->
			{#each xTicks as tick}
				<text
					x={xScale(tick)}
					y={MARGIN.top + innerHeight + 20}
					text-anchor="middle"
					class="axis-tick"
				>
					{tick.toFixed(2)}
				</text>
			{/each}
			
			<!-- X-axis title -->
			<text
				x={MARGIN.left + innerWidth / 2}
				y={chartHeight - 10}
				text-anchor="middle"
				class="axis-title"
			>
				{xLabel}
			</text>
		</svg>
		
		<!-- Tooltip at top of chart - always visible when hovering -->
		{#if hoveredIndex !== null}
			{@const item = sortedData[hoveredIndex]}
			{@const tooltipColor = getBarColor(item.value)}
			<div class="tooltip-top">
				<span class="tooltip-label">{item.label}</span>
				<span class="tooltip-value" style="color: {tooltipColor}">
					{item.value >= 0 ? '+' : ''}{item.value.toFixed(4)}
				</span>
				{#if item.pValue !== undefined}
					<span class="tooltip-pvalue">
						({formatPValueLong(item.pValue)})
					</span>
				{/if}
			</div>
		{/if}
	</div>
	
	<!-- Note -->
	{#if noteText}
		<p class="note">{noteText}</p>
	{/if}
</ChartWrapper>

<style>
	.chart-area {
		overflow-x: auto;
		position: relative;
		padding-top: 2.5rem; /* Space for tooltip */
	}
	
	.bar {
		cursor: pointer;
		transition: fill-opacity 0.15s ease;
	}
	
	.bar-label {
		font-size: 0.7rem;
		fill: #374151;
	}
	
	.axis-tick {
		font-size: 0.75rem;
		fill: #6b7280;
	}
	
	.axis-title {
		font-size: 0.8125rem;
		fill: #4b5563;
		font-weight: 500;
	}
	
	.note {
		font-size: 0.75rem;
		color: #9ca3af;
		margin-top: 0.75rem;
		line-height: 1.4;
	}
	
	.tooltip-top {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 1rem;
		background: #f9fafb;
		border-bottom: 1px solid #e5e7eb;
		font-size: 0.875rem;
		z-index: 10;
	}
	
	.tooltip-label {
		font-weight: 600;
		color: #374151;
	}
	
	.tooltip-value {
		font-weight: 700;
		font-family: ui-monospace, monospace;
	}
	
	.tooltip-pvalue {
		color: #6b7280;
		font-size: 0.75rem;
	}
</style>
