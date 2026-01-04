<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Icon from './Icon.svelte';
	
	export let title: string = '';
	export let subtitle: string = '';
	export let chartId: string = 'chart';
	export let data: Record<string, unknown>[] = [];
	export let showToolbar: boolean = true;
	export let sourceText: string = 'Source: Listening to Indonesia';
	export let columns: string[] = []; // Column keys for table
	export let columnLabels: Record<string, string> = {}; // Column display names
	export let formatters: Record<string, (v: unknown) => string> = {}; // Value formatters
	
	let chartContainer: HTMLDivElement;
	let isFullscreen = false;
	let showTable = false;
	
	const dispatch = createEventDispatcher();
	
	// Download as PNG
	async function downloadPNG() {
		if (!chartContainer) return;
		
		try {
			const { toPng } = await import('html-to-image');
			const dataUrl = await toPng(chartContainer, { 
				backgroundColor: '#ffffff',
				pixelRatio: 3,
				cacheBust: true,
				filter: (node) => {
					// Exclude toolbar buttons from export
					if (node instanceof Element && node.classList?.contains('chart-toolbar')) {
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
		}
	}
	
	// Download as CSV
	function downloadCSV() {
		if (!data || data.length === 0) return;
		
		const headers = Object.keys(data[0]);
		const csvContent = [
			headers.join(','),
			...data.map(row => headers.map(h => {
				const val = row[h];
				if (typeof val === 'string' && val.includes(',')) {
					return `"${val}"`;
				}
				return val;
			}).join(','))
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
	
	// Toggle fullscreen
	function toggleFullscreen() {
		if (!chartContainer) return;
		
		if (!isFullscreen) {
			if (chartContainer.requestFullscreen) {
				chartContainer.requestFullscreen();
			}
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			}
		}
	}
	
	// Listen for fullscreen changes
	function handleFullscreenChange() {
		isFullscreen = !!document.fullscreenElement;
	}
</script>

<svelte:document on:fullscreenchange={handleFullscreenChange} />

<div 
	bind:this={chartContainer} 
	class="chart-wrapper"
	class:fullscreen={isFullscreen}
>
	<!-- Header with title and toolbar -->
	<div class="chart-header">
		<div class="chart-title-area">
			{#if title}
				<h3 class="chart-title">{title}</h3>
			{/if}
			{#if subtitle}
				<p class="chart-subtitle">{subtitle}</p>
			{/if}
		</div>
		
		{#if showToolbar}
			<div class="chart-toolbar">
				<button 
					class="toolbar-btn" 
					on:click={toggleFullscreen} 
					title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
				>
					<Icon name={isFullscreen ? 'minimize' : 'maximize'} size={16} />
				</button>
				{#if columns.length > 0}
					<button 
						class="toolbar-btn"
						class:active={showTable}
						on:click={() => showTable = !showTable} 
						title={showTable ? 'Show chart' : 'Show data table'}
					>
						<Icon name={showTable ? 'bar-chart-2' : 'table'} size={16} />
					</button>
				{/if}
				<button class="toolbar-btn" on:click={downloadCSV} title="Download CSV">
					<Icon name="download" size={16} />
				</button>
				<button class="toolbar-btn" on:click={downloadPNG} title="Download PNG">
					<Icon name="image" size={16} />
				</button>
			</div>
		{/if}
	</div>
	
	<!-- Chart content slot or Table -->
	<div class="chart-content">
		<!-- Table View (hidden when not active) -->
		{#if columns.length > 0}
			<div class="table-container" class:hidden={!showTable}>
				<table class="data-table">
					<thead>
						<tr>
							{#each columns as col}
								<th>{columnLabels[col] || col}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each data as row, rowIndex}
							<tr class:even={rowIndex % 2 === 0}>
								{#each columns as col}
									<td>
										{#if formatters[col]}
											{formatters[col](row[col])}
										{:else}
											{row[col] ?? ''}
										{/if}
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
		<!-- Chart slot (hidden when table is shown) -->
		<div class:hidden={showTable && columns.length > 0}>
			<slot />
		</div>
	</div>
	
	<!-- Source attribution -->
	{#if sourceText}
		<p class="chart-source">{sourceText}</p>
	{/if}
</div>

<style>
	.chart-wrapper {
		background: transparent;
	}
	
	.chart-wrapper.fullscreen {
		background: white;
		border-radius: 0;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 9999;
		overflow: auto;
		padding: 2rem;
		display: flex;
		flex-direction: column;
	}
	
	.chart-wrapper.fullscreen .chart-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}
	
	.chart-wrapper.fullscreen .chart-content > div {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	
	.chart-wrapper.fullscreen .chart-content svg {
		flex: 1;
		min-height: 400px;
		height: auto !important;
	}
	
	.chart-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: 1rem;
		gap: 1rem;
	}
	
	.chart-title-area {
		flex: 1;
	}
	
	.chart-title {
		font-size: 1.125rem;
		font-weight: 700;
		color: #111827;
		margin: 0;
		line-height: 1.3;
	}
	
	.chart-subtitle {
		font-size: 0.875rem;
		color: #6b7280;
		margin: 0.25rem 0 0 0;
	}
	
	.chart-toolbar {
		display: flex;
		gap: 0.25rem;
		flex-shrink: 0;
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
	
	.chart-content {
		min-height: 100px;
	}
	
	.chart-source {
		font-size: 0.75rem;
		color: #9ca3af;
		margin: 1rem 0 0 0;
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
</style>
