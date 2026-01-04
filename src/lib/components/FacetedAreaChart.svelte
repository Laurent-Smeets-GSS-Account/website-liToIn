<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from './Icon.svelte';
	
	interface DataPoint {
		[key: string]: string | number;
	}
	
	export let data: DataPoint[] = [];
	export let title: string = '';
	export let chartId: string = 'faceted-area';
	export let xKey: string = 'date';
	export let yKeys: string[] = [];
	export let labels: Record<string, string> = {};
	export let colors: string[] = ['#10B981', '#3B82F6', '#EF4444'];
	export let facetKey: string = '';
	export let facetOrder: string[] = [];
	
	let wrapper: HTMLDivElement;
	let containerWidth = 900;
	
	// Hover state
	let hoveredFacet: string | null = null;
	let hoveredIndex: number | null = null;
	let mouseX = 0;
	let mouseY = 0;
	
	// Responsive facet dimensions
	$: facetWidth = Math.max(200, Math.floor((containerWidth - 48) / 3) - 12);
	$: facetHeight = Math.round(facetWidth * 0.55);
	$: margin = { top: 28, right: 10, bottom: 32, left: 42 };
	$: innerWidth = facetWidth - margin.left - margin.right;
	$: innerHeight = facetHeight - margin.top - margin.bottom;
	
	// Group data by facet
	$: facets = facetOrder.map(facetValue => {
		const facetData = data
			.filter(d => String(d[facetKey]) === facetValue)
			.sort((a, b) => new Date(String(a[xKey])).getTime() - new Date(String(b[xKey])).getTime());
		return { label: facetValue, data: facetData };
	}).filter(f => f.data.length > 0);
	
	// X scale for each facet
	function getXScale(facetData: DataPoint[]) {
		if (facetData.length === 0) return (_: string) => margin.left;
		
		const dates = facetData.map(d => new Date(String(d[xKey])).getTime());
		const minDate = Math.min(...dates);
		const maxDate = Math.max(...dates);
		const range = maxDate - minDate || 1;
		
		return (dateStr: string) => {
			const t = new Date(dateStr).getTime();
			return margin.left + ((t - minDate) / range) * innerWidth;
		};
	}
	
	// Y scale (0-100%)
	function yScale(value: number): number {
		return margin.top + innerHeight - (value / 100) * innerHeight;
	}
	
	// Generate stacked area path for one series
	function getAreaPath(facetData: DataPoint[], keyIndex: number, xScaleFn: (s: string) => number): string {
		if (facetData.length === 0) return '';
		
		const key = yKeys[keyIndex];
		const points: { x: number; y0: number; y1: number }[] = [];
		
		facetData.forEach((d) => {
			let y0 = 0;
			for (let k = 0; k < keyIndex; k++) {
				y0 += Number(d[yKeys[k]]) || 0;
			}
			const y1 = y0 + (Number(d[key]) || 0);
			
			points.push({
				x: xScaleFn(String(d[xKey])),
				y0: yScale(y0),
				y1: yScale(y1)
			});
		});
		
		// Build path
		let path = '';
		points.forEach((p, i) => {
			path += (i === 0 ? 'M' : 'L') + ` ${p.x.toFixed(1)} ${p.y1.toFixed(1)} `;
		});
		[...points].reverse().forEach((p) => {
			path += `L ${p.x.toFixed(1)} ${p.y0.toFixed(1)} `;
		});
		path += 'Z';
		
		return path;
	}
	
	// Get x-axis ticks
	function getXTicks(facetData: DataPoint[]): number[] {
		if (facetData.length <= 4) return facetData.map((_, i) => i);
		return [0, Math.floor(facetData.length / 2), facetData.length - 1];
	}
	
	// Format date
	function formatDate(dateStr: string): string {
		try {
			const d = new Date(dateStr);
			return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
		} catch {
			return '';
		}
	}
	
	// Find closest data index for hover
	function getClosestIndex(facetData: DataPoint[], x: number, xScaleFn: (s: string) => number): number {
		let closestIdx = 0;
		let closestDist = Infinity;
		
		facetData.forEach((d, i) => {
			const px = xScaleFn(String(d[xKey]));
			const dist = Math.abs(px - x);
			if (dist < closestDist) {
				closestDist = dist;
				closestIdx = i;
			}
		});
		
		return closestIdx;
	}
	
	// Mouse handlers
	function handleMouseMove(event: MouseEvent, facetLabel: string, facetData: DataPoint[], xScaleFn: (s: string) => number) {
		const rect = (event.currentTarget as SVGElement).getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		
		hoveredFacet = facetLabel;
		hoveredIndex = getClosestIndex(facetData, x, xScaleFn);
		mouseX = event.clientX;
		mouseY = event.clientY;
	}
	
	function handleMouseLeave() {
		hoveredFacet = null;
		hoveredIndex = null;
	}
	
	// Download functions
	async function downloadPNG() {
		if (!wrapper) return;
		try {
			const { toPng } = await import('html-to-image');
			const dataUrl = await toPng(wrapper, { 
				backgroundColor: '#ffffff',
				pixelRatio: 3,
				filter: (node) => {
					if (node instanceof Element && node.classList?.contains('toolbar-btn')) return false;
					return true;
				}
			});
			
			const link = document.createElement('a');
			link.href = dataUrl;
			link.download = `${title || chartId}.png`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} catch (err) {
			console.error('Failed to download PNG:', err);
		}
	}
	
	function downloadCSV() {
		if (!data || data.length === 0) return;
		
		const headers = Object.keys(data[0]);
		const csvContent = [
			headers.join(','),
			...data.map(row => headers.map(h => row[h]).join(','))
		].join('\n');
		
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `${title || chartId}.csv`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}
	
	// Resize observer
	onMount(() => {
		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				containerWidth = entry.contentRect.width;
			}
		});
		
		if (wrapper) {
			resizeObserver.observe(wrapper);
			containerWidth = wrapper.clientWidth;
		}
		
		return () => resizeObserver.disconnect();
	});
	
	// Get tooltip data for hovered point
	$: tooltipData = (() => {
		if (hoveredFacet === null || hoveredIndex === null) return null;
		
		const facet = facets.find(f => f.label === hoveredFacet);
		if (!facet || !facet.data[hoveredIndex]) return null;
		
		const d = facet.data[hoveredIndex];
		return {
			date: formatDate(String(d[xKey])),
			facet: hoveredFacet,
			values: yKeys.map((key, i) => ({
				label: labels[key] || key,
				value: Number(d[key]) || 0,
				color: colors[i]
			}))
		};
	})();
</script>

<div bind:this={wrapper} class="faceted-container">
	<!-- Header -->
	<div class="header">
		{#if title}
			<h3 class="title">{title}</h3>
		{/if}
		<div class="toolbar">
			<button class="toolbar-btn" on:click={downloadCSV} title="Download CSV">
				<Icon name="download" size={16} />
			</button>
			<button class="toolbar-btn" on:click={downloadPNG} title="Download PNG">
				<Icon name="image" size={16} />
			</button>
		</div>
	</div>
	
	<!-- Legend -->
	<div class="legend">
		{#each yKeys as key, i}
			<div class="legend-item">
				<span class="legend-color" style="background-color: {colors[i]}"></span>
				<span>{labels[key] || key}</span>
			</div>
		{/each}
	</div>
	
	<!-- Facet Grid -->
	<div class="facet-grid">
		{#each facets as facet}
			{@const xScaleFn = getXScale(facet.data)}
			{@const xTicks = getXTicks(facet.data)}
			{@const isHovered = hoveredFacet === facet.label}
			
			<div class="facet" class:hovered={isHovered}>
				<svg 
					width={facetWidth} 
					height={facetHeight}
					on:mousemove={(e) => handleMouseMove(e, facet.label, facet.data, xScaleFn)}
					on:mouseleave={handleMouseLeave}
				>
					<!-- Title -->
					<text x={facetWidth / 2} y={16} text-anchor="middle" class="facet-title">
						{facet.label}
					</text>
					
					<!-- Background -->
					<rect
						x={margin.left}
						y={margin.top}
						width={innerWidth}
						height={innerHeight}
						fill="#fafafa"
					/>
					
					<!-- Grid lines -->
					{#each [0, 25, 50, 75, 100] as tick}
						<line
							x1={margin.left}
							x2={margin.left + innerWidth}
							y1={yScale(tick)}
							y2={yScale(tick)}
							stroke="#e5e7eb"
							stroke-width="0.5"
						/>
					{/each}
					
					<!-- Y-axis labels -->
					{#each [0, 50, 100] as tick}
						<text
							x={margin.left - 6}
							y={yScale(tick)}
							text-anchor="end"
							dominant-baseline="middle"
							class="axis-label"
						>
							{tick}%
						</text>
					{/each}
					
					<!-- Stacked areas (draw in reverse order so first key is on bottom) -->
					{#each [...yKeys].reverse() as key, reverseIndex}
						{@const keyIndex = yKeys.length - 1 - reverseIndex}
						<path
							d={getAreaPath(facet.data, keyIndex, xScaleFn)}
							fill={colors[keyIndex]}
							fill-opacity="0.85"
						/>
					{/each}
					
					<!-- Hover indicator line -->
					{#if isHovered && hoveredIndex !== null && facet.data[hoveredIndex]}
						<line
							x1={xScaleFn(String(facet.data[hoveredIndex][xKey]))}
							x2={xScaleFn(String(facet.data[hoveredIndex][xKey]))}
							y1={margin.top}
							y2={margin.top + innerHeight}
							stroke="#374151"
							stroke-width="1"
							stroke-dasharray="3,3"
						/>
					{/if}
					
					<!-- X-axis labels -->
					{#each xTicks as tickIndex}
						{#if facet.data[tickIndex]}
							<text
								x={xScaleFn(String(facet.data[tickIndex][xKey]))}
								y={facetHeight - 10}
								text-anchor="middle"
								class="axis-label"
							>
								{formatDate(String(facet.data[tickIndex][xKey]))}
							</text>
						{/if}
					{/each}
				</svg>
			</div>
		{/each}
	</div>
	
	<!-- Global Tooltip -->
	{#if tooltipData}
		<div 
			class="tooltip"
			style="left: {mouseX + 15}px; top: {mouseY - 10}px;"
		>
			<div class="tooltip-header">
				<span class="font-semibold">{tooltipData.facet}</span>
				<span class="text-gray-500">• {tooltipData.date}</span>
			</div>
			<div class="tooltip-values">
				{#each tooltipData.values as item}
					<div class="tooltip-row">
						<span class="tooltip-dot" style="background-color: {item.color}"></span>
						<span class="tooltip-label">{item.label}:</span>
						<span class="tooltip-value">{item.value.toFixed(1)}%</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
	
	<!-- Source -->
	<p class="source">Source: Listening to Indonesia</p>
</div>

<style>
	.faceted-container {
		background: white;
		border-radius: 1rem;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04);
		border: 1px solid rgba(0,0,0,0.06);
		position: relative;
	}
	
	.header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: 1rem;
	}
	
	.title {
		font-size: 1.125rem;
		font-weight: 700;
		color: #111827;
		margin: 0;
	}
	
	.toolbar {
		display: flex;
		gap: 0.25rem;
	}
	
	.toolbar-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		border-radius: 0.5rem;
		background: transparent;
		color: #9ca3af;
		border: none;
		cursor: pointer;
		transition: all 0.15s;
	}
	
	.toolbar-btn:hover {
		background: #f3f4f6;
		color: #374151;
	}
	
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		margin-bottom: 1rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid #f0f0f0;
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
	
	.facet-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.75rem;
	}
	
	@media (max-width: 900px) {
		.facet-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	
	@media (max-width: 600px) {
		.facet-grid {
			grid-template-columns: 1fr;
		}
	}
	
	.facet {
		border-radius: 0.5rem;
		overflow: hidden;
		border: 1px solid transparent;
		transition: border-color 0.15s;
	}
	
	.facet:hover, .facet.hovered {
		border-color: #d1d5db;
	}
	
	.facet svg {
		display: block;
		width: 100%;
		height: auto;
		cursor: crosshair;
	}
	
	.facet-title {
		font-size: 12px;
		font-weight: 600;
		fill: #374151;
	}
	
	.axis-label {
		font-size: 10px;
		fill: #9ca3af;
	}
	
	.source {
		font-size: 0.75rem;
		color: #9ca3af;
		margin: 1rem 0 0 0;
	}
	
	.tooltip {
		position: fixed;
		pointer-events: none;
		background: white;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		font-size: 0.8125rem;
		box-shadow: 0 4px 12px rgba(0,0,0,0.15);
		border: 1px solid #e5e7eb;
		z-index: 1000;
		min-width: 180px;
	}
	
	.tooltip-header {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid #f0f0f0;
		font-size: 0.875rem;
	}
	
	.tooltip-values {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	
	.tooltip-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	
	.tooltip-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}
	
	.tooltip-label {
		color: #6b7280;
		flex: 1;
	}
	
	.tooltip-value {
		font-weight: 600;
		color: #111827;
	}
</style>
