<script lang="ts">
	import { onMount } from 'svelte';
	import { arrayToCSV, downloadFile } from '$lib/utils';
	import Icon from './Icon.svelte';
	
	// Props
	export let data: Array<Record<string, unknown>> = [];
	export let xKey: string = 'date';
	export let yKeys: string[] = ['value'];
	export let colors: string[] = ['#C41E3A', '#1E3A5F', '#D4AF37', '#059669', '#7C3AED'];
	export let labels: Record<string, string> = {};
	export let title: string = '';
	export let xLabel: string = '';
	export let yLabel: string = '';
	export let yFormat: (v: number) => string = (v) => String(v);
	export let chartId: string = 'chart';
	export let height: number = 400;
	
	// State
	let chartContainer: HTMLDivElement;
	let chartWrapper: HTMLDivElement;
	let activeKeys: Set<string> = new Set(yKeys);
	let width = 600;
	let hoveredPoint: { x: number; xValue: string; dataIndex: number; values: Array<{key: string; value: number; y: number; color: string}> } | null = null;
	
	// Fullscreen and size state
	let isFullscreen = false;
	let sizeMultiplier = 1;
	let showTable = false;
	let windowHeight = 800;
	
	// In fullscreen, use most of the window height; otherwise use prop height
	$: currentHeight = isFullscreen 
		? Math.max(400, windowHeight - 200) // Leave room for toolbar, legend, margins
		: Math.round(height * sizeMultiplier);
	
	// Dimensions - more padding for cleaner look
	const margin = { top: 40, right: 40, bottom: 60, left: 70 };
	
	$: innerWidth = width - margin.left - margin.right;
	$: innerHeight = currentHeight - margin.top - margin.bottom;
	
	// Format date string to "Mon YYYY" format
	function formatDateLabel(dateStr: string): string {
		try {
			const date = new Date(dateStr);
			if (isNaN(date.getTime())) return dateStr;
			return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
		} catch {
			return dateStr;
		}
	}
	
	// Data processing
	$: xValues = data.map(d => String(d[xKey]));
	$: xLabelsFormatted = xValues.map(v => formatDateLabel(v));
	$: xScale = (index: number) => margin.left + (index / Math.max(1, data.length - 1)) * innerWidth;
	
	$: yExtent = (() => {
		let min = Infinity;
		let max = -Infinity;
		for (const d of data) {
			for (const key of Array.from(activeKeys)) {
				const val = Number(d[key]);
				if (!isNaN(val)) {
					min = Math.min(min, val);
					max = Math.max(max, val);
				}
			}
		}
		// Add padding
		const padding = (max - min) * 0.15;
		return [Math.max(0, min - padding), max + padding];
	})();
	
	$: yScale = (value: number) => {
		const [min, max] = yExtent;
		return margin.top + innerHeight - ((value - min) / (max - min)) * innerHeight;
	};
	
	// Generate line paths
	$: linePaths = yKeys.map((key, i) => {
		if (!activeKeys.has(key)) return { key, color: colors[i % colors.length], path: '', visible: false };
		
		const points = data
			.map((d, idx) => {
				const val = Number(d[key]);
				if (isNaN(val)) return null;
				return { x: xScale(idx), y: yScale(val) };
			})
			.filter(Boolean) as { x: number; y: number }[];
		
		if (points.length === 0) return { key, color: colors[i % colors.length], path: '', visible: false };
		
		const path = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
		
		return { key, color: colors[i % colors.length], path, visible: true };
	});
	
	// Generate area paths (for fill)
	$: areaPaths = yKeys.map((key, i) => {
		if (!activeKeys.has(key)) return { key, color: colors[i % colors.length], path: '', visible: false };
		
		const points = data
			.map((d, idx) => {
				const val = Number(d[key]);
				if (isNaN(val)) return null;
				return { x: xScale(idx), y: yScale(val) };
			})
			.filter(Boolean) as { x: number; y: number }[];
		
		if (points.length < 2) return { key, color: colors[i % colors.length], path: '', visible: false };
		
		const baseline = margin.top + innerHeight;
		const pathUp = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
		const pathDown = [...points].reverse().map((p) => `L ${p.x} ${baseline}`).join(' ');
		
		return { key, color: colors[i % colors.length], path: `${pathUp} ${pathDown} Z`, visible: true };
	});
	
	// Y-axis ticks
	$: yTicks = (() => {
		const [min, max] = yExtent;
		const tickCount = 6;
		const step = (max - min) / (tickCount - 1);
		return Array.from({ length: tickCount }, (_, i) => min + i * step);
	})();
	
	// X-axis ticks (show subset for readability)
	$: xTicks = (() => {
		const maxTicks = isFullscreen ? 12 : 6;
		if (data.length <= maxTicks) return data.map((_, i) => i);
		const step = Math.ceil(data.length / maxTicks);
		return Array.from({ length: Math.ceil(data.length / step) }, (_, i) => i * step).filter(i => i < data.length);
	})();
	
	// Legend toggle
	function toggleKey(key: string) {
		if (activeKeys.has(key)) {
			if (activeKeys.size > 1) {
				activeKeys.delete(key);
				activeKeys = new Set(activeKeys);
			}
		} else {
			activeKeys.add(key);
			activeKeys = new Set(activeKeys);
		}
	}
	
	// Mouse tracking
	function handleMouseMove(event: MouseEvent) {
		if (!chartContainer) return;
		
		const rect = chartContainer.getBoundingClientRect();
		const mouseX = event.clientX - rect.left;
		
		// Find closest data index based on x position
		let closestIndex = -1;
		let closestDist = Infinity;
		
		for (let i = 0; i < data.length; i++) {
			const x = xScale(i);
			const dist = Math.abs(mouseX - x);
			
			if (dist < closestDist && dist < 50) {
				closestDist = dist;
				closestIndex = i;
			}
		}
		
		if (closestIndex >= 0) {
			const x = xScale(closestIndex);
			const xValue = formatDateLabel(String(data[closestIndex][xKey]));
			
			// Collect all values for this data point
			const values: Array<{key: string; value: number; y: number; color: string}> = [];
			
			for (let keyIndex = 0; keyIndex < yKeys.length; keyIndex++) {
				const key = yKeys[keyIndex];
				if (activeKeys.has(key)) {
					const val = Number(data[closestIndex][key]);
					if (!isNaN(val)) {
						values.push({
							key,
							value: val,
							y: yScale(val),
							color: colors[keyIndex % colors.length]
						});
					}
				}
			}
			
			if (values.length > 0) {
				hoveredPoint = { x, xValue, dataIndex: closestIndex, values };
			} else {
				hoveredPoint = null;
			}
		} else {
			hoveredPoint = null;
		}
	}
	
	function handleMouseLeave() {
		hoveredPoint = null;
	}
	
	// Fullscreen toggle
	function toggleFullscreen() {
		if (!isFullscreen) {
			if (chartWrapper.requestFullscreen) {
				chartWrapper.requestFullscreen();
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
	
	// Track window resize in fullscreen
	function handleResize() {
		if (isFullscreen) {
			windowHeight = window.innerHeight;
		}
	}
	
	// Size controls
	function increaseSize() {
		if (sizeMultiplier < 2) {
			sizeMultiplier = Math.min(2, sizeMultiplier + 0.5);
		}
	}
	
	function decreaseSize() {
		if (sizeMultiplier > 1) {
			sizeMultiplier = Math.max(1, sizeMultiplier - 0.5);
		}
	}
	
	function resetSize() {
		sizeMultiplier = 1;
	}
	
	// Download as PNG
	async function downloadPNG() {
		try {
			const { toPng } = await import('html-to-image');
			
			// Get the entire chart container (includes title)
			const containerEl = chartWrapper.querySelector('.chart-container') as HTMLElement;
			if (!containerEl) {
				throw new Error('Chart container not found');
			}
			
			const dataUrl = await toPng(containerEl, { 
				backgroundColor: '#ffffff',
				pixelRatio: 3,
				quality: 1.0,
				cacheBust: true,
				filter: (node) => {
					// Exclude toolbar buttons from export
					if (node instanceof Element && node.classList?.contains('toolbar-btn')) {
						return false;
					}
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
			alert('Failed to download image. Please try again.');
		}
	}
	
	// Download as CSV
	function downloadCSV() {
		const csvContent = arrayToCSV(data as Record<string, unknown>[]);
		downloadFile(csvContent, `${chartId}.csv`, 'text/csv');
	}
	
	// Resize observer
	onMount(() => {
		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				width = entry.contentRect.width;
			}
		});
		
		if (chartContainer) {
			resizeObserver.observe(chartContainer);
			width = chartContainer.clientWidth;
		}
		
		document.addEventListener('fullscreenchange', handleFullscreenChange);
		
		return () => {
			resizeObserver.disconnect();
			document.removeEventListener('fullscreenchange', handleFullscreenChange);
		};
	});
	
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isFullscreen) {
			document.exitFullscreen();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} on:resize={handleResize} />
<svelte:document on:fullscreenchange={handleFullscreenChange} />

<div 
	bind:this={chartWrapper}
	class="chart-wrapper {isFullscreen ? 'fullscreen-mode' : ''}"
>
	<div class="chart-container" class:fullscreen={isFullscreen}>
		<!-- Header -->
		<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
			{#if title}
				<h3 class="font-bold text-lg text-gray-900">{title}</h3>
			{/if}
			
			<div class="flex items-center gap-2 flex-wrap">
				<!-- Size Controls -->
				<div class="flex items-center gap-1 border-r border-gray-200 pr-2 mr-1">
					<button 
						class="toolbar-btn" 
						on:click={decreaseSize} 
						title="Decrease size"
						disabled={sizeMultiplier <= 1}
						class:opacity-40={sizeMultiplier <= 1}
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
						</svg>
					</button>
					<button 
						class="toolbar-btn" 
						on:click={resetSize} 
						title="Reset size"
					>
						<span class="text-xs font-medium">{Math.round(sizeMultiplier * 100)}%</span>
					</button>
					<button 
						class="toolbar-btn" 
						on:click={increaseSize} 
						title="Increase size"
						disabled={sizeMultiplier >= 2}
						class:opacity-40={sizeMultiplier >= 2}
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
						</svg>
					</button>
				</div>
				
				<!-- Fullscreen Button -->
				<button class="toolbar-btn" on:click={toggleFullscreen} title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
					{#if isFullscreen}
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					{:else}
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
						</svg>
					{/if}
				</button>
				
				<!-- Table/Chart Toggle -->
				<button 
					class="toolbar-btn {showTable ? 'active' : ''}" 
					on:click={() => showTable = !showTable} 
					title={showTable ? 'Show chart' : 'Show data table'}
				>
					{#if showTable}
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
						</svg>
					{:else}
						<Icon name="table" size={16} />
					{/if}
				</button>
				
				<!-- Download Buttons -->
				<button class="toolbar-btn" on:click={downloadPNG} title="Download as PNG">
					<Icon name="image" size={16} />
				</button>
				<button class="toolbar-btn" on:click={downloadCSV} title="Download data as CSV">
					<Icon name="table" size={16} />
				</button>
			</div>
		</div>
		
		<!-- Legend (Clickable Filters) -->
		{#if yKeys.length > 1}
			<div class="flex flex-wrap gap-2 mb-4">
				{#each yKeys as key, i}
					<button
						class="legend-item {activeKeys.has(key) ? 'active' : 'inactive'}"
						on:click={() => toggleKey(key)}
					>
						<span 
							class="w-3 h-3 rounded-full"
							style="background-color: {colors[i % colors.length]}"
						></span>
						<span class="text-sm font-medium">{labels[key] || key}</span>
					</button>
				{/each}
			</div>
			<p class="text-xs text-gray-400 mb-4">Click legend items to show/hide series</p>
		{/if}
		
		<!-- Table View (always rendered, hidden when chart is shown) -->
		<div class="table-container" class:hidden={!showTable} style="max-height: {currentHeight}px;">
			<table class="data-table">
				<thead>
					<tr>
						<th>{xLabel || xKey}</th>
						{#each yKeys as key, i}
							{#if activeKeys.has(key)}
								<th style="color: {colors[i % colors.length]}">{labels[key] || key}</th>
							{/if}
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each data as row, rowIndex}
						<tr class:even={rowIndex % 2 === 0}>
							<td class="font-medium">{formatDateLabel(String(row[xKey]))}</td>
							{#each yKeys as key, i}
								{#if activeKeys.has(key)}
									<td style="color: {colors[i % colors.length]}">{yFormat(Number(row[key]))}</td>
								{/if}
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		
		<!-- Chart SVG (always rendered, hidden when table is shown) -->
		<div 
			bind:this={chartContainer}
			class="relative"
			class:hidden={showTable}
			on:mousemove={handleMouseMove}
			on:mouseleave={handleMouseLeave}
			role="img"
			aria-label={title}
		>
			<svg {width} height={currentHeight} class="overflow-visible">
				<defs>
					<!-- Gradient for area fill -->
					{#each yKeys as key, i}
						{@const safeKey = key.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}
						<linearGradient id="areaGradient-{chartId}-{safeKey}" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stop-color="{colors[i % colors.length]}" stop-opacity="0.25" />
							<stop offset="100%" stop-color="{colors[i % colors.length]}" stop-opacity="0.02" />
						</linearGradient>
						<!-- Gradient for line stroke -->
						<linearGradient id="lineGradient-{chartId}-{safeKey}" x1="0" y1="0" x2="1" y2="0">
							<stop offset="0%" stop-color="{colors[i % colors.length]}" stop-opacity="0.8" />
							<stop offset="50%" stop-color="{colors[i % colors.length]}" stop-opacity="1" />
							<stop offset="100%" stop-color="{colors[i % colors.length]}" stop-opacity="0.8" />
						</linearGradient>
					{/each}
				</defs>
				
				<!-- Y-axis label at top with arrow pointing up -->
				{#if yLabel}
					<g class="y-axis-label">
						<text
							x={margin.left}
							y={margin.top - 20}
							text-anchor="start"
							class="text-xs fill-gray-500 font-medium"
						>
							↑ {yLabel}
						</text>
					</g>
				{/if}
				
				<!-- Grid lines - horizontal only, subtle -->
				<g class="grid-lines">
					{#each yTicks as tick}
						<line
							x1={margin.left}
							x2={width - margin.right}
							y1={yScale(tick)}
							y2={yScale(tick)}
							stroke="#f0f0f0"
							stroke-width="1"
						/>
					{/each}
				</g>
				
				<!-- Area fills -->
				{#each areaPaths as { key, color, path, visible }}
					{@const safeKey = key.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}
					{#if visible && path}
						<path
							d={path}
							fill="url(#areaGradient-{chartId}-{safeKey})"
						/>
					{/if}
				{/each}
				
				<!-- Lines -->
				{#each linePaths as { key, color, path, visible }}
					{@const safeKey = key.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}
					{#if visible && path}
						<path
							d={path}
							fill="none"
							stroke="url(#lineGradient-{chartId}-{safeKey})"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					{/if}
				{/each}
				
				<!-- Data points - only show on hover area -->
				{#if hoveredPoint}
					{#each yKeys as key, keyIndex}
						{#if activeKeys.has(key)}
							{@const val = Number(data[hoveredPoint.dataIndex][key])}
							{#if !isNaN(val)}
								<circle
									cx={hoveredPoint.x}
									cy={yScale(val)}
									r="6"
									fill="white"
									stroke={colors[keyIndex % colors.length]}
									stroke-width="2.5"
									class="drop-shadow-sm"
								/>
							{/if}
						{/if}
					{/each}
				{/if}
				
				<!-- Y-axis -->
				<g class="y-axis">
					{#each yTicks as tick}
						<text
							x={margin.left - 12}
							y={yScale(tick)}
							text-anchor="end"
							dominant-baseline="middle"
							class="text-xs fill-gray-400"
						>
							{yFormat(tick)}
						</text>
					{/each}
				</g>
				
				<!-- X-axis baseline -->
				<line
					x1={margin.left}
					x2={width - margin.right}
					y1={currentHeight - margin.bottom}
					y2={currentHeight - margin.bottom}
					stroke="#e5e7eb"
					stroke-width="1"
				/>
				
				<!-- X-axis ticks and labels -->
				<g class="x-axis">
					{#each xTicks as tickIndex}
						<text
							x={xScale(tickIndex)}
							y={currentHeight - margin.bottom + 20}
							text-anchor="middle"
							class="text-xs fill-gray-400"
						>
							{xLabelsFormatted[tickIndex]}
						</text>
					{/each}
				</g>
				
				<!-- X-axis label at bottom right with arrow -->
				{#if xLabel}
					<text
						x={width - margin.right}
						y={currentHeight - 15}
						text-anchor="end"
						class="text-xs fill-gray-500 font-medium"
					>
						{xLabel} →
					</text>
				{/if}
				
				<!-- Hover line and dots -->
				{#if hoveredPoint}
					<line
						x1={hoveredPoint.x}
						x2={hoveredPoint.x}
						y1={margin.top}
						y2={currentHeight - margin.bottom}
						stroke="#d1d5db"
						stroke-width="1"
						stroke-dasharray="4,4"
					/>
					<!-- Dots on each line at hovered position -->
					{#each hoveredPoint.values as v}
						<circle
							cx={hoveredPoint.x}
							cy={v.y}
							r="4"
							fill={v.color}
							stroke="white"
							stroke-width="2"
						/>
					{/each}
				{/if}
			</svg>
			
			<!-- Tooltip -->
			{#if hoveredPoint}
				<div 
					class="tooltip"
					style="left: {Math.min(hoveredPoint.x + 15, width - 180)}px; top: {Math.max(margin.top, 10)}px;"
				>
					<div class="font-semibold text-gray-900 mb-1">{hoveredPoint.xValue}</div>
					{#each hoveredPoint.values as v}
						<div class="tooltip-row">
							<span class="tooltip-dot" style="background: {v.color}"></span>
							<span class="text-gray-600">{labels[v.key] || v.key}:</span>
							<span class="font-semibold" style="color: {v.color}">{yFormat(v.value)}</span>
						</div>
					{/each}
				</div>
			{/if}
		</div>
		
		<!-- Source line for export -->
		<p class="text-xs text-gray-400 mt-4">Source: Listening to Indonesia</p>
	</div>
</div>

<style>
	.chart-wrapper {
		width: 100%;
		max-width: 100%;
		overflow: hidden;
	}
	
	.chart-wrapper.fullscreen-mode {
		position: fixed;
		inset: 0;
		z-index: 9999;
		background: white;
		display: flex;
		flex-direction: column;
		padding: 2rem;
		overflow: auto;
	}
	
	.chart-wrapper.fullscreen-mode .chart-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}
	
	.chart-container {
		background: transparent;
		width: 100%;
		max-width: 100%;
		transition: all 0.3s ease;
		overflow: hidden;
	}
	
	.chart-container.fullscreen {
		background: white;
		max-width: 100%;
		max-height: 100%;
		overflow: auto;
		padding: 1.5rem;
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
	}
	
	.toolbar-btn:hover:not(:disabled) {
		background: #f3f4f6;
		color: #374151;
	}
	
	.toolbar-btn:disabled {
		cursor: not-allowed;
	}
	
	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.75rem;
		border-radius: 9999px;
		cursor: pointer;
		transition: all 0.2s;
		background: #f9fafb;
		border: 1px solid #e5e7eb;
	}
	
	.legend-item:hover {
		background: #f3f4f6;
		border-color: #d1d5db;
	}
	
	.legend-item.active {
		background: #f3f4f6;
		border-color: #d1d5db;
	}
	
	.legend-item.inactive {
		opacity: 0.4;
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
		min-width: 140px;
	}
	
	.tooltip-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.25rem;
		font-size: 0.8125rem;
	}
	
	.tooltip-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}
	
	/* Table styles */
	.table-container {
		overflow: auto;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
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
	
	.toolbar-btn.active {
		background: #dbeafe;
		color: #1d4ed8;
	}
	
	.hidden {
		display: none !important;
	}
</style>
