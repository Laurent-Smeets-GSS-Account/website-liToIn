<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from './Icon.svelte';
	
	interface SankeyFlow {
		source: string;
		target: string;
		value: number;
		percentage: number;
		direction: 'improvement' | 'decline' | 'stable';
	}
	
	export let data: SankeyFlow[] = [];
	export let title: string = '';
	export let chartId: string = 'sankey';
	export let height: number = 450;
	
	let container: HTMLDivElement;
	let wrapper: HTMLDivElement;
	let width = 800;
	let showTable = false;
	let isFullscreen = false;
	let windowHeight = 800;
	
	// Dynamic height for fullscreen
	$: currentHeight = isFullscreen 
		? Math.max(400, windowHeight - 180) 
		: height;
	
	// Node positions
	const margin = { top: 30, right: 150, bottom: 30, left: 150 };
	$: innerWidth = width - margin.left - margin.right;
	$: innerHeight = currentHeight - margin.top - margin.bottom;
	
	// Color scheme
	const colors = {
		improvement: '#10B981', // green
		decline: '#EF4444', // red
		stable: '#6B7280', // gray
	};
	
	// Node labels in order (top to bottom)
	const nodeOrder = ['Rich', 'Upper middle class', 'Lower middle class', 'Poor', 'Extreme poor'];
	
	// Get unique sources and targets
	$: sources = [...new Set(data.map(d => d.source))].sort((a, b) => nodeOrder.indexOf(a) - nodeOrder.indexOf(b));
	$: targets = [...new Set(data.map(d => d.target))].sort((a, b) => nodeOrder.indexOf(a) - nodeOrder.indexOf(b));
	
	// Calculate node totals
	$: sourceTotals = sources.reduce((acc, s) => {
		acc[s] = data.filter(d => d.source === s).reduce((sum, d) => sum + d.value, 0);
		return acc;
	}, {} as Record<string, number>);
	
	$: targetTotals = targets.reduce((acc, t) => {
		acc[t] = data.filter(d => d.target === t).reduce((sum, d) => sum + d.value, 0);
		return acc;
	}, {} as Record<string, number>);
	
	$: totalFlow = data.reduce((sum, d) => sum + d.value, 0);
	
	// Node height calculation
	$: nodeHeightScale = (value: number) => (value / totalFlow) * innerHeight * 0.8;
	
	// Calculate source node positions
	$: sourcePositions = (() => {
		const positions: Record<string, { y: number; height: number }> = {};
		let currentY = margin.top;
		const gap = 15;
		
		for (const source of sources) {
			const h = nodeHeightScale(sourceTotals[source]);
			positions[source] = { y: currentY, height: h };
			currentY += h + gap;
		}
		return positions;
	})();
	
	// Calculate target node positions  
	$: targetPositions = (() => {
		const positions: Record<string, { y: number; height: number }> = {};
		let currentY = margin.top;
		const gap = 15;
		
		for (const target of targets) {
			const h = nodeHeightScale(targetTotals[target]);
			positions[target] = { y: currentY, height: h };
			currentY += h + gap;
		}
		return positions;
	})();
	
	// Calculate link paths
	$: links = (() => {
		// Track current Y position for each source/target
		const sourceCurrentY: Record<string, number> = {};
		const targetCurrentY: Record<string, number> = {};
		
		for (const s of sources) {
			sourceCurrentY[s] = sourcePositions[s]?.y || 0;
		}
		for (const t of targets) {
			targetCurrentY[t] = targetPositions[t]?.y || 0;
		}
		
		// Sort data to draw stable flows first, then by value
		const sortedData = [...data].sort((a, b) => {
			if (a.direction === 'stable' && b.direction !== 'stable') return -1;
			if (a.direction !== 'stable' && b.direction === 'stable') return 1;
			return b.value - a.value;
		});
		
		return sortedData.map(flow => {
			const linkHeight = (flow.value / totalFlow) * innerHeight * 0.8;
			
			const sourceY = sourceCurrentY[flow.source];
			const targetY = targetCurrentY[flow.target];
			
			sourceCurrentY[flow.source] += linkHeight;
			targetCurrentY[flow.target] += linkHeight;
			
			const x0 = margin.left + 20;
			const x1 = margin.left + innerWidth - 20;
			const y0 = sourceY + linkHeight / 2;
			const y1 = targetY + linkHeight / 2;
			
			// Create curved path
			const curvature = 0.5;
			const xi = (x0 + x1) / 2;
			
			const path = `
				M ${x0} ${sourceY}
				C ${xi} ${sourceY}, ${xi} ${targetY}, ${x1} ${targetY}
				L ${x1} ${targetY + linkHeight}
				C ${xi} ${targetY + linkHeight}, ${xi} ${sourceY + linkHeight}, ${x0} ${sourceY + linkHeight}
				Z
			`;
			
			return {
				...flow,
				path,
				linkHeight,
				sourceY,
				targetY,
				color: colors[flow.direction]
			};
		});
	})();
	
	// Hover state
	let hoveredFlow: typeof links[0] | null = null;
	
	// Resize observer
	onMount(() => {
		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				width = entry.contentRect.width;
			}
		});
		
		if (container) {
			resizeObserver.observe(container);
			width = container.clientWidth;
		}
		
		return () => resizeObserver.disconnect();
	});
	
	// Download as PNG
	async function downloadPNG() {
		try {
			const { toPng } = await import('html-to-image');
			const dataUrl = await toPng(container, { 
				backgroundColor: '#ffffff',
				pixelRatio: 3 
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
	
	// Download as CSV
	function downloadCSV() {
		const headers = ['source', 'target', 'value', 'percentage', 'direction'];
		const csvContent = [
			headers.join(','),
			...data.map(row => [row.source, row.target, row.value, row.percentage, row.direction].join(','))
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
	
	// Fullscreen toggle
	function toggleFullscreen() {
		if (!wrapper) return;
		
		if (!isFullscreen) {
			if (wrapper.requestFullscreen) {
				wrapper.requestFullscreen();
			}
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			}
		}
	}
	
	function handleFullscreenChange() {
		isFullscreen = !!document.fullscreenElement;
		if (isFullscreen) {
			windowHeight = window.innerHeight;
		}
	}
	
	function handleResize() {
		if (isFullscreen) {
			windowHeight = window.innerHeight;
		}
	}
</script>

<svelte:window on:resize={handleResize} />
<svelte:document on:fullscreenchange={handleFullscreenChange} />

<div bind:this={wrapper} class="sankey-container" class:fullscreen={isFullscreen}>
	<!-- Header -->
	<div class="flex items-center justify-between mb-4">
		{#if title}
			<h3 class="font-bold text-lg text-gray-900">{title}</h3>
		{/if}
		<div class="flex gap-1">
			<button 
				class="toolbar-btn" 
				on:click={toggleFullscreen} 
				title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
			>
				<Icon name={isFullscreen ? 'minimize' : 'maximize'} size={16} />
			</button>
			<button 
				class="toolbar-btn"
				class:active={showTable}
				on:click={() => showTable = !showTable} 
				title={showTable ? 'Show chart' : 'Show data table'}
			>
				<Icon name={showTable ? 'bar-chart-2' : 'table'} size={16} />
			</button>
			<button class="toolbar-btn" on:click={downloadCSV} title="Download as CSV">
				<Icon name="download" size={16} />
			</button>
			<button class="toolbar-btn" on:click={downloadPNG} title="Download as PNG">
				<Icon name="image" size={16} />
			</button>
		</div>
	</div>
	
	<!-- Table View (hidden when chart shown) -->
	<div class="table-container" class:hidden={!showTable}>
		<table class="data-table">
			<thead>
				<tr>
					<th>Current Class</th>
					<th>Expected Class</th>
					<th>Direction</th>
					<th>Percentage</th>
				</tr>
			</thead>
			<tbody>
				{#each data.sort((a, b) => b.percentage - a.percentage) as row, i}
					<tr class:even={i % 2 === 0}>
						<td>{row.source}</td>
						<td>{row.target}</td>
						<td>
							<span class="direction-badge" style="background: {colors[row.direction]}20; color: {colors[row.direction]}">
								{row.direction === 'improvement' ? '↑ Improvement' : row.direction === 'decline' ? '↓ Decline' : '→ Stable'}
							</span>
						</td>
						<td>{row.percentage.toFixed(1)}%</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	
	<!-- Legend (hidden when table shown) -->
	<div class="flex gap-6 mb-4 text-sm" class:hidden={showTable}>
		<div class="flex items-center gap-2">
			<span class="w-4 h-3 rounded" style="background-color: {colors.improvement}"></span>
			<span class="text-gray-600">Expecting improvement</span>
		</div>
		<div class="flex items-center gap-2">
			<span class="w-4 h-3 rounded" style="background-color: {colors.stable}"></span>
			<span class="text-gray-600">Stable</span>
		</div>
		<div class="flex items-center gap-2">
			<span class="w-4 h-3 rounded" style="background-color: {colors.decline}"></span>
			<span class="text-gray-600">Expecting decline</span>
		</div>
	</div>
	
	<!-- Chart (hidden when table shown) -->
	<div bind:this={container} class="relative chart-inner" class:hidden={showTable}>
		<svg {width} height={currentHeight}>
			<!-- Column labels -->
			<text
				x={margin.left}
				y={15}
				text-anchor="middle"
				class="text-sm font-semibold fill-gray-700"
			>
				Current Class
			</text>
			<text
				x={margin.left + innerWidth}
				y={15}
				text-anchor="middle"
				class="text-sm font-semibold fill-gray-700"
			>
				Expected in 5 Years
			</text>
			
			<!-- Links -->
			{#each links as link}
				<path
					d={link.path}
					fill={link.color}
					fill-opacity={hoveredFlow === link ? 0.8 : 0.4}
					stroke={link.color}
					stroke-width={hoveredFlow === link ? 2 : 0}
					on:mouseenter={() => hoveredFlow = link}
					on:mouseleave={() => hoveredFlow = null}
					class="cursor-pointer transition-opacity"
				/>
			{/each}
			
			<!-- Source nodes (left) -->
			{#each sources as source}
				{@const pos = sourcePositions[source]}
				{#if pos}
					<rect
						x={margin.left}
						y={pos.y}
						width={15}
						height={pos.height}
						fill="#374151"
						rx="2"
					/>
					<text
						x={margin.left - 8}
						y={pos.y + pos.height / 2}
						text-anchor="end"
						dominant-baseline="middle"
						class="text-xs fill-gray-700 font-medium"
					>
						{source}
					</text>
				{/if}
			{/each}
			
			<!-- Target nodes (right) -->
			{#each targets as target}
				{@const pos = targetPositions[target]}
				{#if pos}
					<rect
						x={margin.left + innerWidth - 15}
						y={pos.y}
						width={15}
						height={pos.height}
						fill="#374151"
						rx="2"
					/>
					<text
						x={margin.left + innerWidth + 8}
						y={pos.y + pos.height / 2}
						text-anchor="start"
						dominant-baseline="middle"
						class="text-xs fill-gray-700 font-medium"
					>
						{target}
					</text>
				{/if}
			{/each}
		</svg>
		
		<!-- Tooltip -->
		{#if hoveredFlow}
			<div class="tooltip" style="left: {width / 2 - 100}px; top: 50px;">
				<div class="font-semibold text-gray-900 mb-1">
					{hoveredFlow.source} → {hoveredFlow.target}
				</div>
				<div class="text-gray-600">
					{hoveredFlow.percentage.toFixed(1)}% of population
				</div>
				<div class="text-xs text-gray-500 capitalize mt-1">
					{hoveredFlow.direction === 'improvement' ? 'Expects improvement' : 
					 hoveredFlow.direction === 'decline' ? 'Expects decline' : 'Expects to stay same'}
				</div>
			</div>
		{/if}
	</div>
	
	<!-- Source line -->
	<p class="text-xs text-gray-400 mt-4">Source: Listening to Indonesia</p>
</div>

<style>
	.sankey-container {
		background: transparent;
		width: 100%;
		max-width: 100%;
		overflow: hidden;
	}
	
	.sankey-container.fullscreen {
		position: fixed;
		inset: 0;
		z-index: 9999;
		background: white;
		padding: 2rem;
		overflow: auto;
		display: flex;
		flex-direction: column;
	}
	
	.sankey-container.fullscreen .chart-inner {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.chart-inner {
		width: 100%;
		overflow-x: auto;
	}
	
	.chart-inner svg {
		display: block;
		max-width: 100%;
	}
	
	.toolbar-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		border-radius: 0.5rem;
		transition: all 0.15s ease;
		background: transparent;
		color: #9ca3af;
		border: none;
		cursor: pointer;
	}
	
	.toolbar-btn:hover {
		background: #f3f4f6;
		color: #374151;
	}
	
	.toolbar-btn.active {
		background: #dbeafe;
		color: #1d4ed8;
	}
	
	.hidden {
		display: none !important;
	}
	
	/* Table styles */
	.table-container {
		overflow: auto;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		max-height: 400px;
	}
	
	.data-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.8125rem;
	}
	
	.data-table th,
	.data-table td {
		padding: 0.5rem 0.75rem;
		text-align: left;
		white-space: nowrap;
	}
	
	.data-table th {
		background: #f9fafb;
		font-weight: 600;
		position: sticky;
		top: 0;
		border-bottom: 2px solid #e5e7eb;
	}
	
	.data-table td {
		border-bottom: 1px solid #f3f4f6;
	}
	
	.data-table tr.even td {
		background: #fafafa;
	}
	
	.data-table tr:hover td {
		background: #f0f9ff;
	}
	
	.direction-badge {
		display: inline-block;
		padding: 0.125rem 0.5rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 500;
	}
	
	.tooltip {
		position: absolute;
		pointer-events: none;
		background: white;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		box-shadow: 0 4px 12px rgba(0,0,0,0.15);
		border: 1px solid #e5e7eb;
		z-index: 10;
		min-width: 200px;
	}
	
	.hidden {
		display: none !important;
	}
</style>
